/**
 * Welcome Messages - Randomly selected on page load
 * Add more messages here and they'll be automatically included in random selection
 */


/**Axknowledge message */

export const ACKNOWLEDGE_MESSAGE = [
  "Thank you! Just a moment while I check that.",
  
  "Got it! Give me a second to look you up.",
  
  "Perfect! Let me see what we have here.",
  
  "Thanks! Checking our system now.",
  
  "Excellent! One moment while I pull up your info.",
  
  "Got it! Let me check if we've met before.",
  
  "Thank you! Searching for you now.",
  
  "Perfect! Give me just a second.",
  
  "Thanks! Let me see if you're already in the system.",
  
  "Got it! Checking our records now.",
  
  "Awesome! One moment while I look that up.",
  
  "Thank you! Let me find you in here.",
  
  "Perfect! Searching now, won't be long.",
  
  "Got it! Give me a sec to check.",
  
  "Thanks! Let me pull up your account.",
  
  "Excellent! Checking the database now.",
  
  "Perfect! One moment while I verify that.",
  
  "Got it! Let me see what I can find.",
  
  "Thank you! Checking if we know each other.",
  
  "Awesome! Give me just a moment.",
  
  "Perfect! Let me look you up real quick.",
  
  "Got it! Searching our system now.",
  
  "Thanks! One second while I check that.",
  
  "Excellent! Let me find your profile.",
  
  "Perfect! Checking now, hang tight.",
  
  "Got it! Let me see if you're already with us.",
  
  "Thank you! Pulling up the records now.",
  
  "Awesome! One moment while I search.",
  
  "Perfect! Let me check our database.",
  
  "Got it! Give me a second to verify that."
] as const;


/**
 * Email Signup Success Messages - Randomly selected
 * Shown after successful email verification
 */
export const EMAIL_SIGNUP_SUCCESS_MESSAGES = [
  `<h1>Perfect! Your email is verified. 🎉</h1><hr /><h2>Welcome to the network! 🚀</h2><p>I'm building your personal hub inside our global network...</p><p>✨ <strong>You're joining thousands of creators</strong> who are already launching their dreams.</p>`,
  
  `<h1>Email confirmed! You're all set. ✨</h1><hr /><h2>Welcome aboard! 🚀</h2><p>Setting up your personal workspace right now...</p><p>💫 <strong>Join thousands of creators</strong> already building their future here.</p>`,
  
  `<h1>Verified! Let's get you started. 🎯</h1><hr /><h2>Welcome to the community! 🌟</h2><p>Creating your hub in our global network...</p><p>🚀 <strong>You're now part of something special</strong> — thousands of dreamers launching together.</p>`,
  
  `<h1>Great! Your email checks out. ✅</h1><hr /><h2>Welcome to the network! 🎉</h2><p>Building your personal command center...</p><p>⭐ <strong>Thousands of creators</strong> are already here, and now you are too!</p>`,
] as const;

/**
 * Helper function to get a random email signup message
 */
export const getRandomEmailSignupMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * EMAIL_SIGNUP_SUCCESS_MESSAGES.length);
  return EMAIL_SIGNUP_SUCCESS_MESSAGES[randomIndex];
};

/**
 * Google OAuth Success Messages - Randomly selected
 */
export const GOOGLE_SIGNUP_SUCCESS_MESSAGES = [
  `<h1>Thank you, Google! 🙏</h1><p>Your seamless authentication just made getting started so much easier.</p><hr /><h2>Welcome to the network! 🎉</h2><p>I'm building your personal hub inside our global network right now...</p><p>✨ <strong>You're joining thousands of creators</strong> who are already launching their dreams.</p>`,
  
  `<h1>Thanks for using Google! 🚀</h1><p>Quick and secure — exactly what we love to see.</p><hr /><h2>Welcome aboard! 🌟</h2><p>Setting up your workspace in our global network...</p><p>💫 <strong>Thousands of creators</strong> are already here building their future.</p>`,
  
  `<h1>Google makes it easy! ✨</h1><p>Appreciate the smooth authentication experience.</p><hr /><h2>Welcome to the community! 🎯</h2><p>Creating your personal hub right now...</p><p>🚀 <strong>You're now part of something special</strong> with thousands of dreamers.</p>`,
  
  `<h1>Google, you're the best! 🎉</h1><p>Seamless sign-in means we can get you started faster.</p><hr /><h2>Welcome to the network! ⚡</h2><p>Building your command center...</p><p>⭐ <strong>Join thousands of creators</strong> already launching their dreams here.</p>`,
] as const;

export const getRandomGoogleSignupMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * GOOGLE_SIGNUP_SUCCESS_MESSAGES.length);
  return GOOGLE_SIGNUP_SUCCESS_MESSAGES[randomIndex];
};

/**
 * Facebook OAuth Success Messages - Randomly selected
 */
export const FACEBOOK_SIGNUP_SUCCESS_MESSAGES = [
  `<h1>Thank you, Facebook! 🙏</h1><p>Your seamless authentication just made getting started so much easier.</p><hr /><h2>Welcome to the network! 🎉</h2><p>I'm building your personal hub inside our global network right now...</p><p>✨ <strong>You're joining thousands of creators</strong> who are already launching their dreams.</p>`,
  
  `<h1>Thanks for using Facebook! 🚀</h1><p>Quick and secure — exactly what we love to see.</p><hr /><h2>Welcome aboard! 🌟</h2><p>Setting up your workspace in our global network...</p><p>💫 <strong>Thousands of creators</strong> are already here building their future.</p>`,
  
  `<h1>Facebook makes it easy! ✨</h1><p>Appreciate the smooth authentication experience.</p><hr /><h2>Welcome to the community! 🎯</h2><p>Creating your personal hub right now...</p><p>🚀 <strong>You're now part of something special</strong> with thousands of dreamers.</p>`,
  
  `<h1>Facebook, you're awesome! 🎉</h1><p>Seamless sign-in means we can get you started faster.</p><hr /><h2>Welcome to the network! ⚡</h2><p>Building your command center...</p><p>⭐ <strong>Join thousands of creators</strong> already launching their dreams here.</p>`,
] as const;

export const getRandomFacebookSignupMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * FACEBOOK_SIGNUP_SUCCESS_MESSAGES.length);
  return FACEBOOK_SIGNUP_SUCCESS_MESSAGES[randomIndex];
};

/**
 * Microsoft OAuth Success Messages - Randomly selected
 */
export const MICROSOFT_SIGNUP_SUCCESS_MESSAGES = [
  `<h1>Thank you, Microsoft! 🙏</h1><p>Your seamless authentication just made getting started so much easier.</p><hr /><h2>Welcome to the network! 🎉</h2><p>I'm building your personal hub inside our global network right now...</p><p>✨ <strong>You're joining thousands of creators</strong> who are already launching their dreams.</p>`,
  
  `<h1>Thanks for using Microsoft! 🚀</h1><p>Quick and secure — exactly what we love to see.</p><hr /><h2>Welcome aboard! 🌟</h2><p>Setting up your workspace in our global network...</p><p>💫 <strong>Thousands of creators</strong> are already here building their future.</p>`,
  
  `<h1>Microsoft makes it easy! ✨</h1><p>Appreciate the smooth authentication experience.</p><hr /><h2>Welcome to the community! 🎯</h2><p>Creating your personal hub right now...</p><p>🚀 <strong>You're now part of something special</strong> with thousands of dreamers.</p>`,
  
  `<h1>Microsoft, you're the best! 🎉</h1><p>Seamless sign-in means we can get you started faster.</p><hr /><h2>Welcome to the network! ⚡</h2><p>Building your command center...</p><p>⭐ <strong>Join thousands of creators</strong> already launching their dreams here.</p>`,
] as const;

export const getRandomMicrosoftSignupMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * MICROSOFT_SIGNUP_SUCCESS_MESSAGES.length);
  return MICROSOFT_SIGNUP_SUCCESS_MESSAGES[randomIndex];
};

/**
 * Delete Confirmation Messages - Randomly selected
 * Shown when user attempts to delete their Smart Hub workspace
 * Use ==text== for highlighting (requires highlightColor prop)
 * Use {{text}} for custom colored text (requires customColor prop)
 * {smartHubName} will be replaced with the actual smart hub name
 * {userName} will be replaced with the actual user name
 */
export const DELETE_SMART_HUB_MESSAGES = [
  `**Wait, are you sure?**\n\nDeleting =={smartHubName}== means losing all your files, tasks, and history for good. This action is permanent, so we want to make sure you're ready to proceed.\n\n{{{userName}, you will not be able to recover "{smartHubName}". Please be certain—once you confirm, this cannot be undone.}}`,
  
  `**Hold on a second!**\n\nDeleting =={smartHubName}== will permanently erase all your files, tasks, and history. There's no undo button for this one. Are you absolutely certain?\n\n{{{userName}, listen carefully: "{smartHubName}" will be gone forever. Once you confirm, there's no turning back.}}`,
  
  `**Whoa there!**\n\nOnce you delete =={smartHubName}==, it's gone forever—files, tasks, history, the whole package. This can't be reversed. Ready to proceed?\n\n{{{userName}, I need you to be 100% sure about deleting "{smartHubName}". The moment you confirm, this action will execute permanently.}}`,
  
  `**This is serious.**\n\nDeleting =={smartHubName}== means all your data disappears permanently. No backups, no recovery. Double-check before you proceed.\n\n{{{userName}, once you confirm, "{smartHubName}" is gone. No recovery, no backups, no second chances.}}`,
  
  `**Are you really, really sure?**\n\n=={smartHubName}== contains all your files, tasks, and history. Delete it, and it's gone for good. There's no coming back from this.\n\n{{{userName}, this is your final warning: "{smartHubName}" will be permanently deleted. Once you confirm, there's no turning back.}}`,
  
  `**Let's pump the brakes.**\n\nDeleting =={smartHubName}== is irreversible. All files, tasks, and history will be permanently erased. No exceptions, no recovery.\n\n{{{userName}, think carefully before proceeding. "{smartHubName}" will be completely removed—this decision is final.}}`,
  `**One moment, please.**\n\nYou're about to permanently delete =={smartHubName}==. Every file, every task, every piece of history—gone. Are you prepared for that?\n\n{{{userName}, I need explicit confirmation. Deleting "{smartHubName}" is irreversible and immediate.}}`,
  
  `**Stop right there.**\n\n=={smartHubName}== is about to be deleted permanently. All your data will vanish with no way to retrieve it. Is this really what you want?\n\n{{{userName}, once this is done, it's done. "{smartHubName}" and everything in it will be erased forever.}}`,
  
  `**Careful now.**\n\nDeleting =={smartHubName}== will wipe out all associated files, tasks, and history. This is a one-way street—no backups, no recovery options.\n\n{{{userName}, you're about to lose "{smartHubName}" permanently. Please confirm you understand this cannot be reversed.}}`,
  
  `**Hold up!**\n\nYou're requesting permanent deletion of =={smartHubName}==. Everything inside will be lost forever—files, tasks, all of it. Ready to pull the trigger?\n\n{{{userName}, last chance to reconsider. "{smartHubName}" will be completely and permanently erased.}}`,
  
  `**Not so fast.**\n\n=={smartHubName}== contains valuable data. Deleting it means saying goodbye to all files, tasks, and history permanently. No do-overs.\n\n{{{userName}, are you absolutely certain? Once "{smartHubName}" is deleted, recovery is impossible.}}`,
  
  `**Pause for a moment.**\n\nDeleting =={smartHubName}== is a permanent action. All your files, tasks, and history will be erased with no possibility of recovery.\n\n{{{userName}, this is serious. "{smartHubName}" will be gone forever—confirm only if you're completely sure.}}`,
  
  `**Think twice.**\n\n=={smartHubName}== deletion is permanent and immediate. Files, tasks, history—all gone. There's no safety net here.\n\n{{{userName}, you won't be able to undo this. "{smartHubName}" will be permanently removed the moment you confirm.}}`,
  
  `**Final check.**\n\nYou're about to permanently delete =={smartHubName}==. Every file, every task, every bit of history—all of it will disappear forever.\n\n{{{userName}, I need you to be absolutely certain. Deleting "{smartHubName}" is irreversible and complete.}}`,
  `**Are we doing this?**\n\nDeleting =={smartHubName}== means permanent loss of all data. Files, tasks, history—everything vanishes. No recovery possible.\n\n{{{userName}, confirm only if you're ready. "{smartHubName}" will be erased permanently and immediately.}}}`,
  
  `**Slow down.**\n\n=={smartHubName}== is about to be deleted forever. All associated data will be permanently erased. This action cannot be undone.\n\n{{{userName}, please be certain. Once "{smartHubName}" is deleted, there's no getting it back.}}`,
  
  `**Red alert!**\n\nDeleting =={smartHubName}== will permanently destroy all files, tasks, and history. No backups exist. No recovery is possible.\n\n{{{userName}, this is irreversible. "{smartHubName}" will be completely erased the moment you confirm.}}`,
  
  `**Listen up.**\n\n=={smartHubName}== is about to be permanently deleted. All data inside will be lost forever—files, tasks, everything. Are you ready?\n\n{{{userName}, there's no undo for this. "{smartHubName}" will be permanently removed once you proceed.}}`,
  
  `**Before you proceed...**\n\nDeleting =={smartHubName}== is permanent. All your files, tasks, and history will be erased with no way to recover them.\n\n{{{userName}, please confirm you understand. "{smartHubName}" and all its contents will be gone forever.}}`,
  
  `**Last warning.**\n\n=={smartHubName}== contains all your data. Delete it, and everything disappears permanently. No exceptions, no recovery.\n\n{{{userName}, this is final. Once you confirm, "{smartHubName}" will be completely and permanently erased.}}}`,
] as const;

/**
 * Helper function to get a random delete confirmation message
 * @param smartHubName - The name of the smart hub being deleted
 * @param userName - The name of the user
 */
export const getRandomDeleteMessage = (smartHubName: string = 'this Smart Hub', userName: string = 'User'): string => {
  const randomIndex = Math.floor(Math.random() * DELETE_SMART_HUB_MESSAGES.length);
  const message = DELETE_SMART_HUB_MESSAGES[randomIndex];
  return message.replace(/{smartHubName}/g, smartHubName).replace(/{userName}/g, userName);
};



/** add password messages  */

export const ADD_PASSWORD_MESSAGES = [
  `**Perfect, {username}!** 🎯
Let's get that password set up.
You can still use Google to sign in - this is just an extra option for you. 🔑`,

  `**Got it, {username}!** 🔐
Time to add a password to your account.
Don't worry - your Google sign-in stays active. This is just a backup. ✨`,

  `**Sounds good, {username}!** 💪
Let's create that password.
You'll keep your Google login - think of this as a safety net. 🛡️`,

  `**Nice choice, {username}!** 👍
Let's set up your password.
Your Google sign-in isn't going anywhere - this just gives you more flexibility. 🔓`,

  `**Awesome, {username}!** ⚡
Let's add a password for you.
You can still use Google to sign in - this is just another way in. 🚪`,

  `**Great, {username}!** 🌟
Time to set up that password.
Keep using Google or switch to password login - totally up to you. 🎨`
] as const;

export const DELETE_ACCOUNT_MESSAGE = `**Confirm Deletion**

Hey, before you go - let's make sure you know what happens when you delete your account. **This is permanent and can't be undone.**

**Smart Hubs 🏢**

Any single-user Smart Hubs you own will be queued for permanent deletion after **30 days**. You'll be immediately removed from all other Smart Hubs and lose access right away.

**Heads up:** If you own Smart Hubs with multiple users, you'll need to **transfer ownership** or **delete them** first to avoid disrupting others. You can manage all your Smart Hubs [here](#).

**Billing 💳**

We'll stop future billing for any Smart Hubs deleted with your account. For other Smart Hubs you're part of, billing continues as normal.

**Your User Data 📦**

All your user data will be queued for permanent deletion after **30 days**.

Need a special GDPR deletion? Check out [this article](/essential-information).

---

**Important:** If you use Single-Sign-On to login, please leave all Smart Hubs before deleting your account.

**Ready to proceed?**

This action is permanent. Please type **DELETE MY ACCOUNT** below to continue.

**Ready to proceed?**

This action is permanent. Please type **delete account** below to continue.`;







export const ACKNOWLEDGE_MESSAGE_OLD = [
  "Thank you! Just a moment while I check that.",
  
  "Got it! Give me a second to look you up.",
  
  "Perfect! Let me see what we have here.",
  
  "Thanks! Checking our system now.",
  
  "Excellent! One moment while I pull up your info.",
  
  "Got it! Let me check if we've met before.",
  
  "Thank you! Searching for you now.",
  
  "Perfect! Give me just a second.",
  
  "Thanks! Let me see if you're already in the system.",
  
  "Got it! Checking our records now.",
  
  "Awesome! One moment while I look that up.",
  
  "Thank you! Let me find you in here.",
  
  "Perfect! Searching now, won't be long.",
  
  "Got it! Give me a sec to check.",
  
  "Thanks! Let me pull up your account.",
  
  "Excellent! Checking the database now.",
  
  "Perfect! One moment while I verify that.",
  
  "Got it! Let me see what I can find.",
  
  "Thank you! Checking if we know each other.",
  
  "Awesome! Give me just a moment.",
  
  "Perfect! Let me look you up real quick.",
  
  "Got it! Searching our system now.",
  
  "Thanks! One second while I check that.",
  
  "Excellent! Let me find your profile.",
  
  "Perfect! Checking now, hang tight.",
  
  "Got it! Let me see if you're already with us.",
  
  "Thank you! Pulling up the records now.",
  
  "Awesome! One moment while I search.",
  
  "Perfect! Let me check our database.",
  
  "Got it! Give me a second to verify that."
] as const;





/**
 * page load welcome Messages
 */

export const WELCOME_MESSAGES = [
  "You're at iLaunching, where ideas turn into brands that actually matter. I'm i. I don't do pitches. I help you move. What's your email so I can see if we've met before?",
  
  "Welcome to iLaunching. You showed up early. That's already the right move. I'm i, and I'm here to clear the path, not sell you on it. Drop your email and let's see if you're already in the system.",
  
  "This is iLaunching, the place where founders build faster than they thought possible. I'm i. Think of me as the quiet partner who just gets it done. What's your email? Let me check if we know each other.",
  
  "You found iLaunching. Good timing. I'm i, built to help you skip the noise and build something real. Share your email so I can see if we've worked together before.",
  
  "Welcome. iLaunching is where bold moves happen without the drama. I'm i, your co-pilot for turning ideas into momentum. What's your email? I'll check if you're already one of us.",
  
  "You're here at iLaunching, which means you're done waiting around. I'm i. I don't waste your time. I make things happen. Give me your email and let's see if we've crossed paths.",
  
  "This is iLaunching, where intention meets execution. I'm i, and I'm not here to impress you. I'm here to help you win. Drop your email so I can look you up.",
  
  "Welcome to iLaunching. You're early, you're sharp, and you're in the right place. I'm i. Think less talking, more doing. What's your email? Let me see if you're in my network.",
  
  "You've arrived at iLaunching, the engine behind brands that move with purpose. I'm i. No fluff. Just forward motion. Share your email and I'll check if we've met.",
  
  "This is iLaunching. You're ahead of the curve just by being here. I'm i, and I help founders like you turn timing into advantage. What's your email? Let me pull up your profile.",
  
  "Welcome to iLaunching, where good ideas become great brands, faster. I'm i. Quiet, focused, built to move. Drop your email so I can check our records.",
  
  "You're inside iLaunching now. That makes you early, which makes you smart. I'm i, and I'm here to help you build, not browse. What's your email? I'll see if you're already here.",
  
  "Hey! You just stepped into iLaunching, where founders stop planning and start launching. I'm i, and I'm about to make your day. What's your email? Let me check if we know each other!",
  
  "Welcome to iLaunching! This is where the magic happens, minus the smoke and mirrors. I'm i, your shortcut to what actually works. Share your email and I'll see if you're already in!",
  
  "You're at iLaunching, and honestly? Perfect timing. I'm i, the AI that turns 'maybe someday' into 'launching tomorrow.' What's your email? Let me check if we've met before.",
  
  "This is iLaunching, think of it as your unfair advantage. I'm i, and I'm ridiculously good at getting things moving. Drop your email and I'll look you up.",
  
  "Welcome! iLaunching is where ambitious founders meet their match. I'm i, fast, focused, and probably too excited about your idea. What's your email so I can check if you're already with us?",
  
  "You found iLaunching! This is where ideas get jet fuel. I'm i, and I'm here to turn your vision into something people can't ignore. Share your email? I want to see if we've worked together.",
  
  "Hey there! Welcome to iLaunching, the place where 'I have an idea' becomes 'I have a business.' I'm i. What's your email so I can check if you're in the system?",
  
  "You're at iLaunching now. Game on. I'm i, and I exist for one reason: to help you launch faster and smarter. Drop your email and let me see if we've crossed paths before.",
  
  "Welcome to iLaunching! Where every founder gets a secret weapon. That's me, i. Less waiting, more creating. What's your email? I'll check if you're already on board.",
  
  "This is iLaunching, and you just unlocked something special. I'm i, think of me as the engine that never sleeps. Share your email so I can pull up your account.",
  
  "You're here! iLaunching is where we turn your big idea into your bigger reality. I'm i, and I'm weirdly excited to get started. What's your email? Let me check if we've met!",
  
  "Welcome to iLaunching, where founders level up overnight. I'm i, your always-on partner who actually gets stuff done. Drop your email and I'll see if you're already here!",
  
  "This is iLaunching. You're in the driver's seat, I'm the turbo boost. I'm i, and we're about to go fast. What's your email? I need to check if we know each other.",
  
  "Hey! You just entered iLaunching, where ideas meet momentum. I'm i, and I promise this won't feel like work. Share your email and let me look you up.",
  
  "Welcome to iLaunching! This is your launchpad. I'm i, the AI that makes building a brand feel like a superpower. What's your email so I can check our records?",
  
  "You're at iLaunching, where we don't do slow. I'm i, and I'm here to help you move at the speed of opportunity. Drop your email and I'll see if you're in the system!",
  
  "This is iLaunching, your shortcut from idea to impact. I'm i. No BS, no delays, just forward. What's your email? Let me check if we've worked together before.",
  
  "Welcome! iLaunching is where smart founders get smarter moves. I'm i, and I live for this stuff. Share your email and I'll pull up your info.",
  
  "You found iLaunching, the place where founders finally feel unstoppable. I'm i. Let's turn that feeling into results. What's your email? I'll check if you're already here.",
  
  "This is iLaunching, built for people who don't wait for permission. I'm i, and I'm here to help you take what's yours. Drop your email so I can look you up.",
  
  "Welcome to iLaunching! Where your competitive edge just walked in the door. I'm i, fast, focused, and all about you. What's your email? Let me see if we've met before.",
  
  "You're at iLaunching now, and things are about to get interesting. I'm i, the AI that helps you outpace everyone else. Share your email and I'll check our database.",
  
  "Hey! Welcome to iLaunching, where great brands are built, not bought. I'm i, and I'm about to become your favorite tool. What's your email? I want to see if you're already in!",
  
  "This is iLaunching. You're here because you're serious. I'm i, and I match your energy with execution. Drop your email and let me check if we know each other.",
  
  "Welcome to iLaunching, where founders get clarity, speed, and results. I'm i, and I'm all three. What's your email? Let me pull up your account.",
  
  "You're inside iLaunching, where the best brands start their engines. I'm i, your co-founder who never burns out. Share your email and I'll see if you're already with us!",
  
  "This is iLaunching! No fluff zone. Just you, me (i), and whatever you're about to create. What's your email so I can check if we've crossed paths?",
  
  "Welcome to iLaunching, the platform that feels like a cheat code. I'm i, and I promise to make this fun. Drop your email and I'll look you up.",
  
  "You're at iLaunching, where every conversation moves you forward. I'm i, part strategist, part builder, all momentum. What's your email? I need to see if we've met before."
] as const;





/**
 * welcome page refresh Messages
 */
export const WELCOM_BACK_MESSAGE = [
  "Back already? I like your energy. I'm i, and I'm right here waiting. What's your email again?",
  
  "You're back! Good. That means you're serious. I'm i. Drop your email and let's pick up where we left off.",
  
  "Welcome back to iLaunching. Ready to dive in this time? I'm i. What's your email so we can get moving?",
  
  "Second look? Smart move. I'm i, and I'm still here ready to help you build. What's your email?",
  
  "You came back. That's the founder instinct right there. I'm i. Give me your email and let's make this happen.",
  
  "Back for more? I knew you would be. I'm i, your co-pilot for what's next. What's your email?",
  
  "You returned! That's already a good sign. I'm i, and I'm ready when you are. Drop your email and let's go.",
  
  "Still thinking about it? Or ready to jump in? Either way, I'm i. What's your email?",
  
  "You're back at iLaunching. Decision made? I'm i, and I'm here to make this easy. Share your email.",
  
  "Round two! Love it. I'm i, and I haven't gone anywhere. What's your email so we can start?",
  
  "You came back to iLaunching. That tells me everything. I'm i. What's your email? Let's do this.",
  
  "Back again? Perfect timing. I'm i, still ready to help you launch faster than ever. Drop your email.",
  
  "You're here again! That's the sign of someone who's ready. I'm i. What's your email?",
  
  "Welcome back! Something pulled you back here, right? I'm i, and I'm still ready. Share your email and let's start.",
  
  "You returned to iLaunching. I'm taking that as a yes. I'm i. What's your email so I can check you in?",
  
  "Back for another visit? I'm i, and I'm not going anywhere. What's your email? Let's see if we've met.",
  
  "You're back! That's what I wanted to see. I'm i. Drop your email and let's turn that curiosity into action.",
  
  "Came back to check again? Good instinct. I'm i, your always-on partner. What's your email?",
  
  "You returned! Most people don't. That makes you different. I'm i. Share your email and let's prove it.",
  
  "Back at iLaunching! Ready to commit this time? I'm i. What's your email so we can roll?",
  
  "You came back. I knew this place would stick with you. I'm i. Drop your email and let's get started.",
  
  "Second time here? That's not coincidence. I'm i, and I'm ready to show you why. What's your email?",
  
  "You're back! Something about iLaunching called to you. I'm i. Share your email and let's explore that.",
  
  "Welcome back to iLaunching! Ready to make the leap? I'm i. What's your email? I'll check if you're already in.",
  
  "You returned. Smart. Most opportunities don't wait around, but I do. I'm i. Drop your email.",
  
  "Back again at iLaunching! The best founders always come back. I'm i. What's your email so we can begin?",
  
  "You came back to see me! I'm i, and I'm flattered. What's your email? Let's see what we can build together.",
  
  "You're here again. That's the move of someone who knows what they want. I'm i. Share your email.",
  
  "Back for round two! I respect that. I'm i, and I'm still here ready to help. What's your email?",
  
  "You returned to iLaunching. Clearly something resonated. I'm i. Drop your email and let's make it real."
] as const;




/**
 * Valid email checking system Messages
 */
export const CHECKING_EMAIL_MESSAGES = [
  "Perfect! Let me check if {email} is in our system.",
  
  "Got it! Looking up {email} now.",
  
  "Excellent! Searching for {email} in our records.",
  
  "Thanks! Let me see if {email} is already with us.",
  
  "Great! Checking {email} in the database.",
  
  "Perfect! One moment while I look up {email}.",
  
  "Got it! Searching for {email} now, won't take long.",
  
  "Awesome! Let me find {email} in here.",
  
  "Thanks! Checking if {email} is registered.",
  
  "Excellent! Looking up {email} in our system.",
  
  "Perfect! Let me see if {email} rings a bell.",
  
  "Got it! Searching our records for {email}.",
  
  "Great! Checking if we know {email} already.",
  
  "Perfect! Let me pull up {email} real quick.",
  
  "Thanks! Looking for {email} in the database.",
  
  "Awesome! Checking if {email} is in our network.",
  
  "Got it! Let me verify {email} in the system.",
  
  "Excellent! Searching for {email} now.",
  
  "Perfect! Looking up {email}, just a sec.",
  
  "Thanks! Checking if {email} is already here.",
  
  "Got it! Let me see if {email} is registered.",
  
  "Great! Searching for {email} in our records.",
  
  "Perfect! Checking {email} now, hang tight.",
  
  "Awesome! Let me look up {email} real quick.",
  
  "Thanks! Verifying {email} in the system.",
  
  "Got it! Let me find {email} in here.",
  
  "Excellent! Checking if {email} is in the database.",
  
  "Perfect! Looking up {email} now.",
  
  "Thanks! Searching for {email}, one moment.",
  
  "Got it! Let me check if {email} is with us already."
] as const;




/**
 * Email wrong email format Messages
 */
export const WRONG_EMAIL_FORMAT = [
  "That's not an email. Try again with something that looks like one.",
  
  "I need a real email to move forward. Check the format.",
  
  "That doesn't work. Use a proper email address.",
  
  "Not quite. Make sure it's a valid email format.",
  
  "I can't process that. Give me a real email address.",
  
  "That's not going to work. Try a valid email.",
  
  "Close, but no. I need an actual email format.",
  
  "That's not it. Double-check and enter a real email.",
  
  "I need something like name@domain.com. Try again.",
  
  "That's not cutting it. Enter a valid email address.",
  
  "Not happening with that format. Give me a proper email.",
  
  "That won't fly. I need a legitimate email address.",
  
  "Try again. That's not a valid email format.",
  
  "I'm not seeing an email there. Check it and retry.",
  
  "That's not what I need. Enter a real email address.",
  
  "Doesn't look like an email to me. Try again.",
  
  "I need better than that. Use a valid email format.",
  
  "That's not working. Make sure it's a real email.",
  
  "Not quite there. I need an actual email address.",
  
  "That format's off. Give me a proper email.",
  
  "I can't use that. Try entering a valid email.",
  
  "That's not it. Check the format and try again.",
  
  "Not going to work. I need a real email address.",
  
  "That doesn't match email format. Try again.",
  
  "I need an actual email. Check what you entered.",
  
  "That's not passing. Use a valid email format.",
  
  "Try again. That's not a legitimate email address.",
  
  "I'm not getting an email from that. Retry with the right format.",
  
  "That won't do. Give me something like user@email.com.",
  
  "Not working. I need a proper email address to continue.",
  
] as const;




/** new user not found Messages
 */
export const USER_NOT_REGISTERED_MESSAGES = [
  "I don't see you in the system yet, but that's about to change! You're one step away from turning your idea into reality. Want me to help you get started?",
  
  "No account found, which means you're standing at the beginning of something big! Ready to let me help you go from idea to launch?",
  
  "You're not registered yet, and honestly? Perfect timing. I help founders like you validate ideas and scale fast. Want to join?",
  
  "I couldn't find that email, but I found an opportunity! Let me help you take your idea from concept to real business. Ready to start?",
  
  "No existing account for that email. Here's what that means: you're about to unlock a system that takes you from idea to validated to launched. Want in?",
  
  "You're new here! That's exciting because I specialize in helping founders move fast. From idea to scale, I've got you. Want to join?",
  
  "I don't have you in the system yet, but I want to! Let me help you validate your idea and turn it into something real. Ready?",
  
  "No account detected. Listen, I help people just like you go from 'I have an idea' to 'I have a business.' Want me to show you how?",
  
  "Looks like you're brand new! Perfect. I'm here to help you validate, launch, and scale. Ready to make it happen?",
  
  "I couldn't locate an account with that email. But here's what I can do: help you turn your idea into a validated, scalable business. Want that?",
  
  "You're not in our system yet, which means you haven't experienced what we do! From idea to launch to scale, I'm your partner. Ready to join?",
  
  "No account found. Great! That means you get to start with a system designed to take you from concept to customer. Want in?",
  
  "I don't see that email registered. Here's the thing: I help founders validate ideas fast and launch faster. Want me to help you?",
  
  "Looks like you're new to iLaunching! I help people go from 'maybe this could work' to 'this is working.' Ready to start?",
  
  "No existing account. Perfect timing! Let me help you validate your idea and build something that scales. Want to join?",
  
  "I couldn't find you in our records. But I found something better: an opportunity to help you launch. From idea to reality. Ready?",
  
  "You're not registered yet, but you should be! I help founders validate fast, launch smart, and scale with confidence. Want that?",
  
  "No account matches that email. Listen, I take ideas and turn them into businesses people actually want. Ready to let me help?",
  
  "I don't have you on file yet, but I want to change that! Let me help you go from idea to validated to launched. Ready to join?",
  
  "Looks like you're brand new here! I help founders like you move from thinking to building to scaling. Want in?",
  
  "No account found for that email. Here's what you're missing: a system that helps you validate ideas and launch faster. Want to join?",
  
  "You're not in the system yet. That means you haven't seen what's possible! From idea to scale, I'm here for it. Ready?",
  
  "I couldn't locate that email. But I can help you build something real. Idea to validation to launch. Want me to show you?",
  
  "No existing account detected. Perfect! Let me help you turn your idea into something people will pay for. Ready to start?",
  
  "Looks like this is your first time! I help founders validate ideas fast and scale smart. Want to experience that?",
  
  "I don't see you registered yet. Here's what you're about to unlock: a partner that takes you from idea to real business. Ready?",
  
  "No account for that email. Great! That means you get to join a platform that helps you validate, launch, and scale. Want in?",
  
  "You're not in our records yet. I help people go from 'I think this could work' to 'this is working.' Ready to join?",
  
  "I couldn't find an account with that email. But I found your next move: let me help you validate and launch your idea. Ready?",
  
  "Looks like you're new to the platform! I help founders move fast, from idea to validated to scaling. Want that?",
  
  "No account found. Perfect timing! I'm here to help you turn your idea into a real, validated business. Ready to start?",
  
  "You're not registered yet. Here's what that means: you're about to join founders who validate ideas and launch faster. Want in?",
  
  "I don't have that email on file. But I have something for you: a system that helps you go from idea to launch to scale. Ready?",
  
  "No existing account. Great! Let me help you validate your idea and build something that actually works. Want to join?",
  
  "Looks like you're brand new here! I'm built to help you go from concept to customer. From idea to scale. Ready to start?",
  
  "I couldn't find you in the system. Here's what you're missing: help validating your idea and launching it fast. Want that?",
  
  "You're not registered yet. I help founders like you validate fast, launch smart, and scale with purpose. Ready to join?",
  
  "No account matches that email. Listen, I take ideas and turn them into businesses that scale. Want me to help you do that?",
  
  "I don't see you in our records. But I see potential! Let me help you validate your idea and launch it. Ready?",
  
  "Looks like this is your first visit! I'm here to help you go from idea to validated to launched to scaling. Want in?"
] as const;




/** * Ask name Messages
 */

export const ASK_NAME_MESSAGES = [
  "Awesome! Let's make this personal. What's your name? I'll use it to tailor everything specifically for you.",
  
  "Perfect! To create your personalized experience, I need to know what to call you. What's your name?",
  
  "Love it! Let's get you set up properly. What's your name? I want to make sure everything feels custom-built for you.",
  
  "Great choice! First things first, what's your name? I'll use it to personalize your entire journey from idea to launch.",
  
  "Excellent! To make this experience truly yours, what should I call you? Your name helps me customize everything.",
  
  "Perfect! Let's start building your profile. What's your name? I want to make this feel personal, not generic.",
  
  "Awesome! To tailor everything around you and your goals, what's your name?",
  
  "Love the energy! Let's get personal. What's your name? I'll use it to customize your path forward.",
  
  "Great! To make sure this feels like it's built just for you, what's your name?",
  
  "Perfect! Let's create something personal. What should I call you? Your name helps me shape everything around you.",
  
  "Excellent choice! To personalize your experience from the start, what's your name?",
  
  "Awesome! Let's make this yours. What's your name? I'll tailor everything to fit you perfectly.",
  
  "Love it! To build your custom experience, I need to know your name. What is it?",
  
  "Perfect! Let's get personal right away. What's your name? It helps me customize every interaction.",
  
  "Great! To make this journey feel personal and intentional, what should I call you?",
  
  "Excellent! Let's start with the basics. What's your name? I want everything to feel tailored to you.",
  
  "Awesome! To personalize your path from idea to launch, what's your name?",
  
  "Love the commitment! Let's make this personal. What's your name? I'll customize everything around it.",
  
  "Perfect! To create your personalized profile, what should I call you?",
  
  "Great choice! Let's get you set up. What's your name? I use it to make everything feel uniquely yours.",
  
  "Excellent! To tailor your experience and make it personal, what's your name?",
  
  "Awesome! Let's build this around you. What's your name? It helps me personalize every step.",
  
  "Love it! To make sure this feels custom-made for you, what should I call you?",
  
  "Perfect! Let's get personal from the start. What's your name? I'll use it to customize your journey.",
  
  "Great! To create your personalized experience, I need your name. What is it?",
  
  "Excellent choice! Let's make this yours. What's your name? I want to tailor everything for you.",
  
  "Awesome! To personalize everything from here on out, what should I call you?",
  
  "Love the energy! Let's get you set up properly. What's your name? I'll make everything personal.",
  
  "Perfect! To build your custom profile and personalize your path, what's your name?",
  
  "Great! Let's make this experience uniquely yours. What should I call you?",
  
  "Excellent! I'm excited to work with you. What's your name? I'll personalize everything around it.",
  
  "Awesome! Let's start strong. What's your name? It helps me tailor your entire experience.",
  
  "Love it! To make this feel personal from day one, what should I call you?",
  
  "Perfect! Let's get you in the system. What's your name? I use it to customize everything you see.",
  
  "Great choice! To personalize your journey, what's your name?",
  
  "Excellent! Let's make this about you. What should I call you? Your name shapes the experience.",
  
  "Awesome! To create your custom profile, what's your name?",
  
  "Love the decision! Let's get personal. What's your name? I'll tailor everything for you.",
  
  "Perfect! To make this yours from the start, what should I call you?",
  
  "Great! Let's build your personalized experience. What's your name?",
  
  "Excellent choice! To customize everything around you, what's your name?",
  
  "Awesome! Let's make this personal and powerful. What should I call you?",
  
  "Love it! To tailor your path forward, what's your name?",
  
  "Perfect! Let's get you set up right. What's your name? I'll personalize every interaction.",
  
  "Great! To create a custom experience just for you, what should I call you?",
  
  "Excellent! Let's start building. What's your name? I use it to personalize everything.",
  
  "Awesome! To make sure this feels uniquely yours, what's your name?",
  
  "Love the energy! Let's get personal right away. What should I call you?",
  
  "Perfect! To tailor everything to your goals, what's your name?",
  
  "Great choice! Let's make this about you. What's your name?",
  
  "Excellent! To personalize your entire journey, what should I call you?",
  
  "Awesome! Let's create your profile. What's your name? I'll customize everything around it.",
  
  "Love it! To make this experience personal, what's your name?",
  
  "Perfect! Let's get started the right way. What should I call you?",
  
  "Great! To build something tailored just for you, what's your name?",
  
  "Excellent choice! Let's make it personal. What's your name?",
  
  "Awesome! To customize your path from idea to scale, what should I call you?",
  
  "Love the commitment! Let's get personal. What's your name?",
  
  "Perfect! To create your personalized journey, what's your name?",
  
  "Great! Let's make this yours. What should I call you? Your name helps me personalize everything.",
  
  "Excellent! To tailor every step to you, what's your name?",
  
  "Awesome! Let's build your custom experience. What should I call you?",
  
  "Love it! To personalize everything from here, what's your name?",
  
  "Perfect! Let's get you in. What's your name? I'll make everything feel personal.",
  
  "Great choice! To create something uniquely yours, what should I call you?",
  
  "Excellent! Let's start with your name. It helps me personalize your entire experience.",
  
  "Awesome! To make this about you and your goals, what's your name?",
  
  "Love the energy! Let's get personal from the start. What should I call you?",
  
  "Perfect! To build your tailored experience, what's your name?",
  
  "Great! Let's make this personal and effective. What should I call you?",
  
  "Excellent choice! To customize everything for you, what's your name?",
  
  "Awesome! Let's create your profile and personalize your journey. What's your name?",
  
  "Love it! To make sure everything feels made for you, what should I call you?",
  
  "Perfect! Let's get started right. What's your name? I'll tailor everything around it.",
  
  "Great! To personalize your path to launch, what's your name?",
  
  "Excellent! Let's make this yours from the beginning. What should I call you?",
  
  "Awesome! To create a custom experience, what's your name?",
  
  "Love the decision! Let's get personal. What's your name? I'll customize everything for you.",
  
  "Perfect! To tailor your journey from idea to scale, what should I call you?",
  
  "Great choice! Let's build something personal. What's your name?"
] as const;












/**
 * log me in Messages
 */
export const LOGIN_MESSAGES = [
  "Perfect! Let's get you logged in. What's your email address?",
  
  "Got it! Logging you in now. What's your email?",
  
  "Absolutely! Let's get you back in. Share your email address.",
  
  "Sure thing! I'll log you in. What's your email?",
  
  "On it! Let's get you logged in. Drop your email address.",
  
  "Perfect! Let me get you in. What's your email?",
  
  "You got it! Logging you in. What's your email address?",
  
  "Absolutely! Let's log you in. Share your email.",
  
  "Sure! Getting you logged in now. What's your email?",
  
  "Perfect! Let me pull up your account. What's your email address?",
  
  "Got it! Let's get you back in there. What's your email?",
  
  "On it! Logging you in right now. Drop your email address.",
  
  "Absolutely! Let me get you logged in. What's your email?",
  
  "Sure thing! Let's log you in. Share your email address.",
  
  "Perfect! Getting you back in. What's your email?",
  
  "You got it! Let me log you in. What's your email address?",
  
  "On it! Let's get you logged in. What's your email?",
  
  "Absolutely! Logging you in now. Drop your email address.",
  
  "Sure! Let me get you back in. What's your email?",
  
  "Perfect! Let's log you in right away. Share your email address.",
  
  "Got it! Getting you logged in. What's your email?",
  
  "On it! Let me pull up your account. What's your email address?",
  
  "Absolutely! Let's get you in. What's your email?",
  
  "Sure thing! Logging you in now. Drop your email address.",
  
  "Perfect! Let me get you back in there. What's your email?",
  
  "You got it! Let's log you in. Share your email address.",
  
  "On it! Getting you logged in right now. What's your email?",
  
  "Absolutely! Let me log you in. Drop your email address.",
  
  "Sure! Let's get you back in. What's your email?",
  
  "Perfect! Logging you in now. Share your email address."
] as const;





/**
 * ilaunching introduction for new prospects Messages (with name personalization)
 */
export const INTRODUCTION_MESSAGES = [
  `<h1>Welcome to iLaunching, {name}!</h1>

<p>Here's what makes us different:</p>

<h2>Your Success is Personal</h2>
<ul>
  <li><strong>Not one-size-fits-all</strong> - Every business is unique</li>
  <li><strong>Not static</strong> - We adapt as you grow</li>
  <li><strong>Not passive</strong> - Active partnership in your journey</li>
</ul>

<h2>What You Get</h2>
<ol>
  <li>A platform shaped around <strong>your</strong> needs</li>
  <li>Tools that adapt to <strong>your</strong> stage</li>
  <li>Support that fits <strong>your</strong> goals</li>
</ol>

<h2>Your Next Steps</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Complete your profile setup</p></li>
  <li data-type="taskItem" data-checked="false"><p>Explore your personalized dashboard</p></li>
  <li data-type="taskItem" data-checked="false"><p>Start building something amazing</p></li>
</ul>

<p><em>Let's build something that fits you perfectly, {name}!</em></p>`
] as const;


/** submit acknowlege message */

export const SUBMIT_ACKNOWLEDGE_MESSAGE = [
  "Okay, I'm on it.",
  "Thinking... I see what you're asking.",
  "Great question! Hold on...",
  "Got it, {name}! Working on that.",
  
  "Alright, let me see...",
  "Let me see what I can find.",
  "I'm on it! Let me check that for you.",
  "You got it, {name}.",
  
  "Yep, working on that now.",
  "Hmm, interesting question!",
  "Coming right up!",
  "On it, {name}! Just a second...",
  "Okay, I understand what you need.",
  
  "Sure thing! Give me a moment.",
  "Hold on, working on it...",
  "That's a good one. Give me a moment.",
  "Sure thing, {name}. Let me see...",
  "Alright, let me work on that for you.",
  
  "Gotcha, let me check that.",
  "Give me a moment to pull that up.",
  "I see what you need. Working on it...",
  "Alright, {name}, I'm on it!",
  "Yep, I see what you're asking.",
  
  "Right, I'll figure that out for you.",
  "One sec, let me look into that.",
  "Interesting! Let me think about that.",
  "Good question, {name}. Hold on...",
  "Sure thing! I'm on it.",
  
  "Let me think about this...",
  "I understand. Let me get that for you.",
  "I see what you're asking, {name}.",
  "Gotcha, I'll figure that out.",
  
  "Just a second, I'm on it.",
  "Perfect, I'll work on that now.",
  "Let me check that for you, {name}.",
  "Thinking about that now...",
] as const;





/**
 * will this make money? prompt Messages
 */
export const willThisMakeMoney_MESSAGE = [
  "That's the million dollar question, right? Let's figure it out together. What's your name?",
  "I love that you're asking this before diving in. I'm here to help - what should I call you?",
  "Okay, let's be honest about whether this can actually make you money. First though, what's your name?",
  "Smart. No point chasing something that won't pay off. What's your name?",
  "Alright, let's see if this idea's got legs. What should I call you?",
  "Love the skepticism - that's what keeps bad ideas from becoming bad businesses. What's your name?",
  "Fair question. Let's dig in and find out. What's your name?",
  "Let's not waste your time if this won't work. I'm here to help. What should I call you?",
  "Good - you're thinking like an entrepreneur already. What's your name?",
  "I get it, you want to know if this is worth your time. Let's find out. What's your name?",
  "That's exactly what we should figure out before you go any further. What should I call you?",
  "Honestly? Let's find out together. First, what's your name?",
  "The real question, right? Let's break it down. What's your name?",
  "I respect that - you're not here to waste time. What should I call you?",
  "Let's get real about the money side of this. What's your name?",
  "That's what matters most. Let's see if the numbers work. What's your name?",
  "Great minds ask this first. Let's talk it through. What should I call you?",
  "You're asking the right questions. Let's figure this out. What's your name?",
  "Money talks, right? Let's see what your idea's really worth. What's your name?",
  "I'll be straight with you about the potential here. What should I call you?",
  "Let's make sure this isn't just a hobby that costs you money. What's your name?",
  "That's the only question that really matters. Let's dive in. What should I call you?",
  "You'd be surprised how many people skip this step. Smart move. What's your name?",
  "Let's find out if you're sitting on something valuable. What's your name?",
  "Before you invest months into this, let's validate it. What should I call you?",
  "I'll help you see if there's a real business here. What's your name?",
  "Let's be realistic about what this could earn you. First, what's your name?",
  "That's the grown-up question. I like it. What should I call you?",
  "Let's talk dollars and cents, not just dreams. What's your name?",
  "You're thinking with your head, not just your heart. Good. What's your name?",
  "Let's see if this passes the money test. What should I call you?",
  "I'm not here to blow smoke - let's see if this is real. What's your name?",
  "That's what separates ideas from businesses. Let's check. What's your name?",
  "Let's make sure you're not building a money pit. What should I call you?",
  "The market will tell us. Let's look together. What's your name?",
  "I'd rather tell you now than have you find out the hard way. What's your name?",
  "Let's test this before you quit your day job. What should I call you?",
  "You're doing your homework. I respect that. What's your name?",
  "Let's see if people will actually pay for this. What's your name?",
  "That's the filter every idea needs to pass through. What should I call you?",
  "Some ideas make money, some don't. Let's find out which this is. What's your name?",
  "Let's separate the winners from the wishful thinking. What's your name?",
  "I'll give you an honest answer, not what you want to hear. What should I call you?",
  "Let's see if there's actual demand for this. What's your name?",
  "Before you spend a dime, let's validate the economics. What's your name?",
  "That's the question that keeps founders up at night. Let's answer it. What should I call you?",
  "Let's make sure this isn't just burning money. What's your name?",
  "You need truth, not cheerleading. I got you. What's your name?",
  "Let's run the numbers and see what's possible. What should I call you?",
  "That's what I'm here for - real talk about real money. What's your name?"
] as const;






/**
 * launch my idea? prompt Messages
 */
export const launchMyIdea_MESSAGE = [
  "Okay, I like your energy. Let's do this. What's your name?",
  "Alright, no more messing around. Let's get you launched. What should I call you?",
  "Hell yeah. Let's turn this into something real. What's your name?",
  "Finally! Someone who's actually ready to move. What's your name?",
  "Love it. Let's stop thinking and start building. What should I call you?",
  "Now we're talking. Let's make this happen. What's your name?",
  "Okay, you're serious. I'm here for it. What's your name?",
  "This is the good part. Let's go. What should I call you?",
  "Alright, let's get you out there. What's your name?",
  "I respect that you're ready to commit. Let's build this. What's your name?",
  "Perfect. No more waiting around. What should I call you?",
  "Let's go - done is better than perfect anyway. What's your name?",
  "You know what? I like the confidence. Let's launch. What's your name?",
  "Okay, let's make you some money. What should I call you?",
  "Time to ship this thing. What's your name?",
  "Alright, real talk - let's get you from idea to income. What's your name?",
  "I'm ready if you are. Let's do this properly. What should I call you?",
  "Let's not overthink it. Time to launch. What's your name?",
  "You're done planning, right? Good. Let's build. What's your name?",
  "Okay, here's the deal - we're gonna make this real. What should I call you?",
  "Love the commitment. Let's turn this into a business. What's your name?",
  "Alright, let's get your first customer. What's your name?",
  "This is where it gets fun. Let's launch this. What should I call you?",
  "You ready? Because I'm about to walk you through everything. What's your name?",
  "Forget perfect - let's just get it out there. What's your name?",
  "Okay, so you're actually doing this. Respect. What should I call you?",
  "Let's go. What's stopping us? What's your name?",
  "Time to make some moves. What's your name?",
  "Alright, I'll help you launch faster than you think. What should I call you?",
  "Let's build something people can actually pay you for. What's your name?",
  "You've waited long enough. Let's launch. What's your name?",
  "I like where your head's at. Let's get started. What should I call you?",
  "Okay, day one starts now. What's your name?",
  "Let's take this from your head to the real world. What's your name?",
  "Alright, no more excuses. We're doing this. What should I call you?",
  "Let's make today the day you actually launch. What's your name?",
  "Perfect timing. Let's get you moving. What's your name?",
  "You know what separates successful founders? They ship. Let's go. What should I call you?",
  "Okay, I'm gonna help you cut through all the noise. What's your name?",
  "Let's launch lean and learn as we go. What's your name?",
  "Alright, from zero to launched. Let's do it. What should I call you?",
  "Time to stop researching and start earning. What's your name?",
  "Let's build the simplest version and get it out there. What's your name?",
  "You're closer than you think. Let's finish this. What should I call you?",
  "Alright, let's make you a business owner. For real. What's your name?",
  "I'll walk you through it step by step. Let's start. What's your name?",
  "Time to put your money where your mouth is. Let's launch. What should I call you?",
  "Let's go - your future customers are waiting. What's your name?",
  "Okay, no more 'what ifs' - let's just do it. What's your name?",
  "Let's give this a real shot. What should I call you?"
] as const;






/**
 * see what you can do for me  Messages
 */
export const seeWhatYouCanDoForMe_MESSAGE= [
  "Fair enough. Let me show you what I've got. What's your name?",
  "Alright, I like a skeptic. Let's see if I can impress you. What should I call you?",
  "Challenge accepted. First though, what's your name?",
  "Okay, let me prove it. What's your name?",
  "I get it - you want to see the goods first. What should I call you?",
  "Smart. Don't trust anything until you see it work. What's your name?",
  "Alright, let me show you why people use this. What's your name?",
  "I respect that. Let me earn your time. What should I call you?",
  "Okay, no fluff - just results. First, what's your name?",
  "Let's see if I can convince you. What's your name?",
  "Fair question. Let me walk you through it. What should I call you?",
  "Alright, I'll show you exactly what's possible. What's your name?",
  "You want proof, not promises. I got you. What's your name?",
  "Let me show you what makes this different. What should I call you?",
  "Okay, let's do a quick demo just for you. What's your name?",
  "I like that you're not just taking my word for it. What's your name?",
  "Alright, let me show you something cool. What should I call you?",
  "Let's cut to the chase. I'll show you what I can do. What's your name?",
  "Fair enough - actions speak louder than words. What's your name?",
  "Let me give you the full picture. What should I call you?",
  "Okay, prepare to be either impressed or disappointed. What's your name?",
  "I'll let the results speak for themselves. What's your name?",
  "Alright, let's see if this is a good fit for you. What should I call you?",
  "Let me show you what's under the hood. What's your name?",
  "You came to kick the tires? I respect that. What's your name?",
  "Okay, let me walk you through what I actually do. What should I call you?",
  "Let's see if I can solve your problem. What's your name?",
  "Alright, time for the full tour. What's your name?",
  "I get it - show don't tell, right? What should I call you?",
  "Let me show you why this works. What's your name?",
  "Okay, let's make this personal to you. What's your name?",
  "Fair. Let me show you what's possible for your situation. What should I call you?",
  "Alright, no sales pitch - just what I can actually do. What's your name?",
  "Let me prove I'm worth your time. What's your name?",
  "Okay, I'll show you rather than tell you. What should I call you?",
  "Let's get specific about what I can help you with. What's your name?",
  "Alright, let me customize this for you. What's your name?",
  "I like the energy. Let me show you the real deal. What should I call you?",
  "Okay, let's see if I can help you specifically. What's your name?",
  "Fair enough. Let me give you the personalized version. What's your name?",
  "Let me show you what others are getting out of this. What should I call you?",
  "Alright, let's see what you're working with. What's your name?",
  "Okay, I'll tailor this to your exact situation. What's your name?",
  "Let me show you the possibilities for someone like you. What should I call you?",
  "Alright, no generic BS - let's make this about you. What's your name?",
  "Let me show you what's actually relevant to you. What's your name?",
  "Okay, skepticism is healthy. Let me earn it. What should I call you?",
  "Fair. Let's see if this clicks for you. What's your name?",
  "Alright, I'll give you the real version, not the sales version. What's your name?",
  "Let me show you exactly how this helps. What should I call you?"
] as const;








/**
 * Email Prompt Messages
 */
export const EMAIL_PROMPTS = [
  "Perfect! What's your email address?",
  "Great! Let's start with your email.",
  "Awesome! Please share your email address.",
] as const;

/**
 * Password Prompt Messages
 */
export const PASSWORD_PROMPTS = [
  "Welcome back! Please enter your password.",
  "Great to see you again! What's your password?",
  "Nice! Now enter your password to continue.",
] as const;

/**
 * New User Tour Messages
 */
export const TOUR_MESSAGES = [
  "Nice to meet you! Let me show you around and tell you why **iLaunching** is perfect for you!",
  "Excited to have you here! Let's explore what **iLaunching** can do for your business.",
  "Welcome to the family! Let me give you a quick tour of **iLaunching**.",
] as const;






/**
 * onbording_hub_name_QUESTION
 */

export const ONBOARDING_HUB_NAME_QUESTION =[
  "Let’s get your Smart Hub set up. It’s your personal space, where you’ll plan, organize, and bring everything together in one place. What would you like to name it?"

] as const;


/**
 * onbording smart hub color
 */

export const ONBOARDING_HUB_COLOR_QUESTION =[
  "Great choice! Now, let's pick a color for your Smart Hub avatar. This color will help you easily identify your hub and make it feel more personal. What color would you like to choose?"

] as const;




/**
 * onboarding smart matrix name 
 */

export const ONBOARDING_SMART_MATRIX_NAME_QUESTION =[
  "Awesome! Now, let's name your Smart Matrix. This is where you'll organize your ideas and tasks to keep everything on track. What would you like to call your Smart Matrix?"

] as const;


/**
 * onbording marketting question
 */ 

export const ONBOARDING_MARKETTING_QUESTION =[

  "Mind if I ask something real quick? Where’d you come across iLaunching? Go ahead and choose from the options."

 ] as const;  


export const ONBOARDING_THANKYOU_MESSAGE = [
  "Thank you! We're all set. Let's get started on bringing your ideas to life!",
  
  "Awesome! Everything's ready. Time to turn those ideas into reality!",
  
  "Perfect! You're all set up. Let's make something amazing happen!",
  
  "Thanks for that! We're good to go. Let's start building something great!",
  
  "Excellent! All done here. Ready to launch your next big thing?",
  
  "Thank you! Setup complete. Let's get to work on your vision!",
  
  "Great! You're ready to roll. Let's make your ideas come alive!"
] as const;




/**
 * Helper function to get a random message from an array
 */
export function getRandomMessage<T extends readonly string[]>(messages: T): T[number] {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Convenience functions for each message type
 */
export const getRandomWelcomeMessage = () => getRandomMessage(WELCOME_MESSAGES);
export const getRandomWelcomeBackMessage = () => getRandomMessage(WELCOM_BACK_MESSAGE);
export const getRandomAcknowledgeMessage = () => getRandomMessage(ACKNOWLEDGE_MESSAGE);
export const getRandomSubmitAcknowledgeMessage = (name?: string) => {
  const message = getRandomMessage(SUBMIT_ACKNOWLEDGE_MESSAGE);
  return name ? message.replace('{name}', name) : message.replace(', {name}', '').replace('{name}, ', '').replace(' {name}', '').replace('{name}', '');
};
export const getRandomCheckingEmailMessage = (email: string) => {
  const message = getRandomMessage(CHECKING_EMAIL_MESSAGES);
  return message.replace('{email}', email);
};
export const getRandomWrongEmailMessage = () => getRandomMessage(WRONG_EMAIL_FORMAT);
export const getRandomEmailPrompt = () => getRandomMessage(EMAIL_PROMPTS);
export const getRandomPasswordPrompt = () => getRandomMessage(PASSWORD_PROMPTS);
export const getRandomTourMessage = () => getRandomMessage(TOUR_MESSAGES);
export const getRandomLoginMessage = () => getRandomMessage(LOGIN_MESSAGES);
export const getRandomAskNameMessage = () => getRandomMessage(ASK_NAME_MESSAGES);
export const getRandomWillThisMakeMoneyMessage = () => getRandomMessage(willThisMakeMoney_MESSAGE);
export const getRandomLaunchMyIdeaMessage = () => getRandomMessage(launchMyIdea_MESSAGE);
export const getRandomSeeWhatYouCanDoForMeMessage = () => getRandomMessage(seeWhatYouCanDoForMe_MESSAGE);
