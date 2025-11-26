/**
 * System Messages
 * Pre-written messages that are streamed through the API like LLM responses
 */

export const SYSTEM_MESSAGE_TYPES = {
  SALES_WELCOME: '__SYSTEM_SALES_WELCOME__',
  STAGE_TRANSITION: '__SYSTEM_STAGE_TRANSITION__',
  FEATURE_INTRO: '__SYSTEM_FEATURE_INTRO__',
  PROGRESS_UPDATE: '__SYSTEM_PROGRESS_UPDATE__',
} as const;

export type SystemMessageType = typeof SYSTEM_MESSAGE_TYPES[keyof typeof SYSTEM_MESSAGE_TYPES];

/**
 * Welcome messages for sales stage (randomly selected)
 */
export const SALES_WELCOME_MESSAGES = [
  `# Welcome! 🚀

I'm excited to help you **launch your business idea**. 

Let's start by understanding what you're building:

- What **problem** are you trying to solve?
- Who is your **target customer**?
- What makes your solution **unique**?

**Don't worry if you're not sure yet** - we'll figure it out together!

---

*Type your response below and let's get started...*`,

  `# Hey there! 👋

Great to have you here. I'm here to help turn your idea into reality.

Let's dive right in:

### First, tell me about your idea
- What inspired you to start this?
- What specific problem does it solve?
- Who needs this solution the most?

**No pressure** - just share what's on your mind, and we'll build from there!

---

*I'm listening...*`,

  `# Let's Build Something Amazing! ✨

I'm your AI sales consultant, and I'm here to guide you through launching your business.

### To get started, I need to understand:

1. **Your Vision** - What are you trying to create?
2. **The Problem** - What pain point does it address?
3. **Your Customers** - Who will benefit most?

**Think of this as a conversation** - there are no wrong answers!

---

*Share your thoughts below...*`,

  `# Ready to Launch? 🎯

Welcome! I'm here to help you validate, refine, and launch your business idea.

### Let's start with the basics:

- **What's your idea?** (In your own words)
- **Why now?** What makes this the right time?
- **Who's it for?** Your ideal customer

**Remember**: Every great business started with a simple conversation like this one.

---

*Let's begin...*`,

  `# Hi! Let's Talk Business 💡

I'm thrilled to work with you on bringing your idea to life.

### Here's what I need to know first:

> **Your Idea**: What are you planning to build or offer?
> 
> **The Gap**: What problem or need does it address?
> 
> **Your Advantage**: What makes you different from competitors?

**Feeling stuck?** No worries - just tell me what's on your mind, and we'll explore it together!

---

*Start typing below...*`
];

/**
 * Get a random welcome message
 */
export const getRandomWelcomeMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * SALES_WELCOME_MESSAGES.length);
  return SALES_WELCOME_MESSAGES[randomIndex];
};

/**
 * Stage transition messages
 */
export const STAGE_TRANSITION_MESSAGES = {
  discovery_to_validation: `# Great Progress! ✅

I now have a clear picture of your business idea. Let's move to the next phase: **validation**.

### What we'll do next:
1. Test your assumptions about the market
2. Identify your ideal customer profile
3. Validate the problem-solution fit

**This is where we make sure your idea has real demand!**

---

*Ready to continue?*`,

  validation_to_planning: `# Excellent Work! 🎊

Your idea is validated and ready for the next step: **strategic planning**.

### What's next:
- Define your go-to-market strategy
- Set realistic milestones
- Create your launch timeline

**Let's turn this validated idea into an actionable plan!**

---

*Let's keep going...*`
};
