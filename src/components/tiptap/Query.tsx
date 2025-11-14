import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import QueryComponent from './QueryComponent';

export interface QueryOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    query: {
      setQuery: () => ReturnType;
    };
  }
}

export const Query = Node.create<QueryOptions>({
  name: 'query',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: '',

  draggable: true,

  isolating: true,

  addAttributes() {
    return {
      user_avatar_type: {
        default: 'text',
      },
      user_avatar_image_link: {
        default: '',
      },
      user_avatar_svg: {
        default: '',
      },
      user_avatar_text: {
        default: 'UN',
      },
      user_first_name: {
        default: '',
      },
      user_surname: {
        default: '',
      },
      user_id: {
        default: '',
      },
      backgroundColor: {
        default: 'none',
      },
      text: {
        default: '',
      },
      query_id: {
        default: () => 'q_' + Date.now(),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-query]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-query': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QueryComponent);
  },

  addCommands() {
    return {
      setQuery:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              user_avatar_type: 'text',
              user_avatar_image_link: '',
              user_avatar_svg: '',
              user_avatar_text: 'UN',
              user_first_name: '',
              user_surname: '',
              user_id: '',
              backgroundColor: 'none',
              text: '',
              query_id: 'q_' + Date.now(),
            },
          });
        },
    };
  },
});

export default Query;