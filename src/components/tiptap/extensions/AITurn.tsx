import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AITurnComponent from './AITurnComponent.tsx';

export interface AITurnOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiTurn: {
      insertAITurn: (attributes?: {
        turnId?: string;
        timestamp?: number;
        summary?: string;
        cites?: any[];
      }) => ReturnType;
    };
  }
}

export const AITurn = Node.create<AITurnOptions>({
  name: 'aiTurn',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'query response?',

  draggable: false,

  isolating: true,

  addAttributes() {
    return {
      turnId: {
        default: () => 'turn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        parseHTML: element => element.getAttribute('data-turn-id'),
        renderHTML: attributes => {
          return {
            'data-turn-id': attributes.turnId,
          };
        },
      },
      timestamp: {
        default: () => new Date().toISOString(),
        parseHTML: element => element.getAttribute('data-timestamp') || new Date().toISOString(),
        renderHTML: attributes => {
          return {
            'data-timestamp': attributes.timestamp,
          };
        },
      },
      summary: {
        default: '',
        parseHTML: element => element.getAttribute('data-summary'),
        renderHTML: attributes => {
          if (!attributes.summary) return {};
          return {
            'data-summary': attributes.summary,
          };
        },
      },
      cites: {
        default: [],
        parseHTML: element => {
          const citesAttr = element.getAttribute('data-cites');
          try {
            return citesAttr ? JSON.parse(citesAttr) : [];
          } catch {
            return [];
          }
        },
        renderHTML: attributes => {
          if (!attributes.cites || attributes.cites.length === 0) return {};
          return {
            'data-cites': JSON.stringify(attributes.cites),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-turn"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'ai-turn',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AITurnComponent);
  },

  addCommands() {
    return {
      insertAITurn:
        (attributes = {}) =>
        ({ commands, state }) => {
          const { selection } = state;
          const pos = selection.$head.pos;

          const turnId = attributes.turnId || 'turn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

          return commands.insertContentAt(pos, {
            type: this.name,
            attrs: {
              turnId: turnId,
              timestamp: attributes.timestamp || Date.now(),
              summary: attributes.summary || '',
              cites: attributes.cites || [],
            },
            content: [
              {
                type: 'query',
                attrs: {
                  user_avatar_type: 'text',
                  user_avatar_text: 'U',
                  user_first_name: 'User',
                  user_surname: '',
                  user_id: 'user_' + Date.now(),
                  query_id: 'q_' + Date.now(),
                },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '' }],
                  },
                ],
              },
              // No Response node yet - will be added when stream starts
            ],
          });
        },
    };
  },
});

export default AITurn;
