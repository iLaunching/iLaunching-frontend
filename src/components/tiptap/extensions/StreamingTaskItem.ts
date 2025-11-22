import type { KeyboardShortcutCommand } from '@tiptap/core';
import { mergeAttributes, Node, renderNestedMarkdownContent, wrappingInputRule } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface StreamingTaskItemOptions {
  onReadOnlyChecked?: (node: ProseMirrorNode, checked: boolean) => boolean;
  nested: boolean;
  HTMLAttributes: Record<string, any>;
  taskListTypeName: string;
  a11y?: {
    checkboxLabel?: (node: ProseMirrorNode, checked: boolean) => string;
  };
}

export const streamingTaskInputRegex = /^\s*(\[([( |x])?\])\s$/;

export const StreamingTaskItem = Node.create<StreamingTaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {},
      taskListTypeName: 'taskList',
      a11y: undefined,
    };
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph+';
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: element => {
          const dataChecked = element.getAttribute('data-checked');
          return dataChecked === '' || dataChecked === 'true';
        },
        renderHTML: attributes => ({
          'data-checked': attributes.checked,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
      }),
      [
        'label',
        { class: 'task-item-checkbox-wrapper' },
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked ? 'checked' : null,
          },
        ],
        ['span', { class: 'task-item-checkbox-visual' }],
      ],
      ['div', { class: 'task-item-inline-content' }, 0],
    ];
  },

  parseMarkdown: (token, h) => {
    const content = [];

    if (token.tokens && token.tokens.length > 0) {
      content.push(h.createNode('paragraph', {}, h.parseInline(token.tokens)));
    } else if (token.text) {
      content.push(h.createNode('paragraph', {}, [h.createNode('text', { text: token.text })]));
    } else {
      content.push(h.createNode('paragraph', {}, []));
    }

    if (token.nestedTokens && token.nestedTokens.length > 0) {
      const nestedContent = h.parseChildren(token.nestedTokens);
      content.push(...nestedContent);
    }

    return h.createNode('taskItem', { checked: token.checked || false }, content);
  },

  renderMarkdown: (node, h) => {
    const checkedChar = node.attrs?.checked ? 'x' : ' ';
    const prefix = `- [${checkedChar}] `;
    return renderNestedMarkdownContent(node, h, prefix);
  },

  addKeyboardShortcuts() {
    const shortcuts: Record<string, KeyboardShortcutCommand> = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    };

    if (this.options.nested) {
      return {
        ...shortcuts,
        Tab: () => this.editor.commands.sinkListItem(this.name),
      };
    }

    return shortcuts;
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li');
      const checkboxWrapper = document.createElement('label');
      const checkboxStyler = document.createElement('span');
      const checkbox = document.createElement('input');
      const content = document.createElement('div');

      listItem.classList.add('task-item-list-item');
      checkboxWrapper.classList.add('task-item-checkbox-wrapper');
      checkboxStyler.classList.add('task-item-checkbox-visual');
      checkbox.classList.add('task-item-checkbox-input');
      content.classList.add('task-item-inline-content');

      const updateA11Y = (currentNode: ProseMirrorNode) => {
        checkbox.ariaLabel =
          this.options.a11y?.checkboxLabel?.(currentNode, checkbox.checked) ||
          `Task item checkbox for ${currentNode.textContent || 'empty task item'}`;
      };

      updateA11Y(node);

      checkboxWrapper.contentEditable = 'false';
      checkbox.type = 'checkbox';
      checkbox.addEventListener('mousedown', event => event.preventDefault());
      checkbox.addEventListener('change', event => {
        if (!editor.isEditable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked;
          return;
        }

        const { checked } = event.target as HTMLInputElement;

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos();

              if (typeof position !== 'number') {
                return false;
              }

              const currentNode = tr.doc.nodeAt(position);

              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                checked,
              });

              return true;
            })
            .run();
        }

        if (!editor.isEditable && this.options.onReadOnlyChecked) {
          if (!this.options.onReadOnlyChecked(node, checked)) {
            checkbox.checked = !checkbox.checked;
          }
        }
      });

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value);
      });

      listItem.dataset.checked = node.attrs.checked;
      checkbox.checked = node.attrs.checked;

      checkboxWrapper.append(checkbox, checkboxStyler);
      listItem.append(checkboxWrapper, content);

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value);
      });

      return {
        dom: listItem,
        contentDOM: content,
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false;
          }

          listItem.dataset.checked = updatedNode.attrs.checked;
          checkbox.checked = updatedNode.attrs.checked;
          updateA11Y(updatedNode);

          return true;
        },
      };
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: streamingTaskInputRegex,
        type: this.type,
        getAttributes: match => ({
          checked: match[match.length - 1] === 'x',
        }),
      }),
    ];
  },
});
