/**
 * Utility functions for creating formatted messages with TiptapTypewriter
 */

interface FormatHelper {
  header1: (text: string) => string;
  header2: (text: string) => string;
  header3: (text: string) => string;
  bold: (text: string) => string;
  italic: (text: string) => string;
  boldItalic: (text: string) => string;
  bulletList: (items: string[]) => string;
  numberedList: (items: string[]) => string;
  todoList: (items: { text: string; completed: boolean }[]) => string;
  lineBreak: () => string;
  paragraph: (text: string) => string;
}

export const format: FormatHelper = {
  header1: (text: string) => `# ${text}`,
  header2: (text: string) => `## ${text}`,
  header3: (text: string) => `### ${text}`,
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  boldItalic: (text: string) => `***${text}***`,
  bulletList: (items: string[]) => items.map(item => `- ${item}`).join('\n'),
  numberedList: (items: string[]) => items.map((item, index) => `${index + 1}. ${item}`).join('\n'),
  todoList: (items: { text: string; completed: boolean }[]) => 
    items.map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`).join('\n'),
  lineBreak: () => '\n',
  paragraph: (text: string) => `${text}\n`,
};

/**
 * Template builder for creating rich formatted messages
 */
export class MessageBuilder {
  private content: string[] = [];

  h1(text: string): MessageBuilder {
    this.content.push(format.header1(text));
    return this;
  }

  h2(text: string): MessageBuilder {
    this.content.push(format.header2(text));
    return this;
  }

  h3(text: string): MessageBuilder {
    this.content.push(format.header3(text));
    return this;
  }

  p(text: string): MessageBuilder {
    this.content.push(text);
    return this;
  }

  bold(text: string): string {
    return format.bold(text);
  }

  italic(text: string): string {
    return format.italic(text);
  }

  bullets(...items: string[]): MessageBuilder {
    this.content.push(format.bulletList(items));
    return this;
  }

  numbers(...items: string[]): MessageBuilder {
    this.content.push(format.numberedList(items));
    return this;
  }

  todos(...items: { text: string; completed?: boolean }[]): MessageBuilder {
    const todoItems = items.map(item => ({ 
      text: item.text, 
      completed: item.completed || false 
    }));
    this.content.push(format.todoList(todoItems));
    return this;
  }

  br(): MessageBuilder {
    this.content.push('');
    return this;
  }

  build(): string {
    return this.content.join('\n\n');
  }
}

/**
 * Quick builder function
 */
export const message = () => new MessageBuilder();

/**
 * Example usage:
 * 
 * const welcomeMessage = message()
 *   .h1("Welcome to iLaunching!")
 *   .p("Here's what makes us different:")
 *   .bullets(
 *     "**Personalized** approach",
 *     "**Adaptive** platform", 
 *     "**Results-driven** tools"
 *   )
 *   .h2("Next Steps")
 *   .todos(
 *     { text: "Complete signup", completed: true },
 *     { text: "Set up profile" },
 *     { text: "Start first project" }
 *   )
 *   .build();
 */