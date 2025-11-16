import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResponseComponent from './ResponseComponent.tsx';

export interface ResponseOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    response: {
      setResponse: () => ReturnType;
      completeResponse: () => ReturnType;
    };
  }
}

export const Response = Node.create<ResponseOptions>({
  name: 'response',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'response',

  content: 'block+',

  draggable: false,

  isolating: true,

  addAttributes() {
    return {
      responseId: {
        default: () => 'r_' + Date.now(),
      },
      isStreaming: {
        default: false,
      },
      isComplete: {
        default: false,
      },
      turnId: {
        default: '',
      },
      timestamp: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-response]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-response': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResponseComponent);
  },

  addCommands() {
    return {
      setResponse:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              responseId: 'r_' + Date.now(),
              isStreaming: false,
              isComplete: false,
            },
          });
        },
      completeResponse:
        () =>
        ({ tr, state }) => {
          const { doc } = state;
          let responsePos = -1;
          let responseAttrs: any = null;

          // Find the most recent streaming Response node
          doc.descendants((node, pos) => {
            if (node.type.name === 'response' && node.attrs.isStreaming === true) {
              responsePos = pos;
              responseAttrs = node.attrs;
              return false; // Stop searching
            }
          });

          if (responseAttrs && responsePos >= 0) {
            // Update Response attributes to mark as complete
            tr.setNodeMarkup(responsePos, undefined, {
              ...responseAttrs,
              isStreaming: false,
              isComplete: true,
            });
            return true;
          }

          return false;
        },
    };
  },
});

export default Response;
