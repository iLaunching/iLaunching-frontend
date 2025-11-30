import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface StreamAnimationOptions {
  /**
   * Whether animation is enabled
   */
  enabled: boolean;
  /**
   * Duration of the wave animation in ms
   */
  waveDuration: number;
  /**
   * Duration of the fade animation in ms
   */
  fadeDuration: number;
  /**
   * Delay before fade starts (0-1, percentage of fadeDuration)
   */
  fadeDelay: number;
}

export const StreamAnimation = Extension.create<StreamAnimationOptions>({
  name: 'streamAnimation',

  addOptions() {
    return {
      enabled: true,
      waveDuration: 800,
      fadeDuration: 500,
      fadeDelay: 0.3,
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;

    return [
      new Plugin({
        key: new PluginKey('streamAnimation'),
        
        state: {
          init() {
            return {
              animatedNodes: new Map<number, number>(), // pos -> timestamp
              decorations: DecorationSet.empty,
            };
          },
          
          apply(tr, value) {
            if (!extensionThis.options.enabled) {
              return { animatedNodes: new Map(), decorations: DecorationSet.empty };
            }

            let { animatedNodes, decorations } = value;
            const now = Date.now();

            // Map decorations through transaction
            decorations = decorations.map(tr.mapping, tr.doc);

            // Detect new content additions
            tr.steps.forEach((_step, index) => {
              const stepMap = tr.mapping.maps[index];
              
              stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                // Check if this is an insertion (newEnd > newStart)
                if (newEnd > newStart) {
                  
                  // Find all block nodes in the inserted range
                  tr.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                    // Only animate block-level nodes (paragraphs, headings, list items, etc.)
                    if (node.isBlock && pos >= newStart) {
                      animatedNodes.set(pos, now);
                      
                      // Add decoration for line fade
                      const lineDeco = Decoration.node(pos, pos + node.nodeSize, {
                        class: 'stream-animate-line',
                        style: `animation-duration: ${extensionThis.options.fadeDuration}ms;`,
                      });
                      
                      decorations = decorations.add(tr.doc, [lineDeco]);
                      
                      // Add decoration for content wave
                      if (node.content.size > 0) {
                        const contentDeco = Decoration.node(pos, pos + node.nodeSize, {
                          class: 'stream-animate-content',
                          style: `animation-duration: ${extensionThis.options.waveDuration}ms;`,
                        });
                        decorations = decorations.add(tr.doc, [contentDeco]);
                      }
                    }
                  });
                }
              });
            });

            // Clean up old animations (after they're done)
            const maxDuration = Math.max(extensionThis.options.waveDuration, extensionThis.options.fadeDuration);
            animatedNodes.forEach((timestamp, pos) => {
              if (now - timestamp > maxDuration) {
                animatedNodes.delete(pos);
              }
            });

            return { animatedNodes, decorations };
          },
        },

        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            return pluginState?.decorations || DecorationSet.empty;
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'codeBlock'],
        attributes: {
          'data-stream-animated': {
            default: null,
            parseHTML: element => element.getAttribute('data-stream-animated'),
            renderHTML: attributes => {
              if (!attributes['data-stream-animated']) {
                return {};
              }
              return {
                'data-stream-animated': attributes['data-stream-animated'],
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      /**
       * Enable/disable stream animation
       */
      setStreamAnimation: (enabled: boolean) => () => {
        this.options.enabled = enabled;
        return true;
      },
      
      /**
       * Update animation settings
       */
      updateStreamAnimationSettings: (settings: Partial<StreamAnimationOptions>) => () => {
        this.options = { ...this.options, ...settings };
        return true;
      },
    } as any;
  },
});

export default StreamAnimation;
