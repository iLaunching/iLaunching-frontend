import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DataTurnComponent from './DataTurnComponent.tsx';

export interface DataTurnOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dataTurn: {
      insertDataTurn: (attributes?: {
        turnId?: string;
        timestamp?: string;
        messageType?: string;
      }) => ReturnType;
    };
  }
}

export const DataTurn = Node.create<DataTurnOptions>({
  name: 'dataTurn',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'response',

  draggable: false,

  isolating: true,

  addAttributes() {
    return {
      turnId: {
        default: () => 'data_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
      messageType: {
        default: 'SYSTEM',
        parseHTML: element => element.getAttribute('data-message-type') || 'SYSTEM',
        renderHTML: attributes => {
          return {
            'data-message-type': attributes.messageType,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="data-turn"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'data-turn',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DataTurnComponent as any);
  },

  addCommands() {
    return {
      insertDataTurn:
        (attributes = {}) =>
        ({ commands, state }) => {
          const { selection } = state;
          const pos = selection.$head.pos;

          const turnId = attributes.turnId || 'data_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

          return commands.insertContentAt(pos, {
            type: this.name,
            attrs: {
              turnId: turnId,
              timestamp: attributes.timestamp || new Date().toISOString(),
              messageType: attributes.messageType || 'SYSTEM',
            },
            content: [
              {
                type: 'response',
                attrs: {
                  responseId: turnId,
                  isStreaming: true,
                  isComplete: false,
                  turnId: turnId,
                  timestamp: new Date().toISOString(),
                },
                content: [
                  {
                    type: 'paragraph',
                    content: [],
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

export default DataTurn;
