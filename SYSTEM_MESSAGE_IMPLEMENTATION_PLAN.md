# System Message Implementation Plan

## Overview
Create a mechanism to send pre-written system messages through the backend API that stream to the frontend exactly like LLM responses, but without involving the actual LLM. This allows us to send introductions, explanations, and guidance messages that appear seamless to users.

## Use Cases
- Welcome messages when sales stage starts
- Stage transition explanations
- Feature introductions
- Guided onboarding steps
- Error recovery messages
- Progress updates

---

## Architecture

### Flow Diagram
```
Frontend (StreamingChatInterface)
    ↓ POST /api/message with special flag
Backend API Route
    ↓ Detects system message flag
Sales Service (generate_response_with_ui_control)
    ↓ Returns pre-written markdown + UI commands
WebSocket Stream
    ↓ Streams message character-by-character
Frontend
    ↓ Renders markdown in chat (user sees streaming)
```

---

## Phase 1: Create Message Constants

### Step 1.1: Create Constants File
**File:** `/workspaces/Ilaunching-SERVERS/ilaunching-frontend/src/constants/systemMessages.ts`

**Content:**
```typescript
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
```

**Test Criteria:**
- [ ] File created successfully
- [ ] TypeScript compiles without errors
- [ ] Can import constants in other files

---

## Phase 2: Update Frontend to Send System Messages

### Step 2.1: Update StreamingChatInterface Component
**File:** `/workspaces/Ilaunching-SERVERS/ilaunching-frontend/src/components/StreamingChatInterface.tsx`

**Changes:**
1. Import system message constants
2. Add `hasShownWelcome` state
3. Create `sendSystemMessage` function
4. Trigger welcome message on mount

**Code to Add:**
```typescript
import { SYSTEM_MESSAGE_TYPES } from '@/constants/systemMessages';

// Add state
const [hasShownWelcome, setHasShownWelcome] = useState(false);

/**
 * Send system message through API
 * Message will be streamed back like an LLM response
 */
const sendSystemMessage = useCallback(async (messageType: string, metadata: any = {}) => {
  if (!conversationId || !userId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        user_id: userId,
        message: messageType, // Special system flag
        metadata: {
          is_system_message: true,
          ...metadata,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send system message');
    }

    // Response will be streamed through WebSocket
    console.log('System message sent:', messageType);
  } catch (error) {
    console.error('Error sending system message:', error);
  }
}, [conversationId, userId]);

/**
 * Send welcome message when component mounts
 */
useEffect(() => {
  if (conversationId && userId && !hasShownWelcome && messages.length === 0) {
    setHasShownWelcome(true);
    
    // Small delay to let WebSocket connect
    const timer = setTimeout(() => {
      sendSystemMessage(SYSTEM_MESSAGE_TYPES.SALES_WELCOME, {
        stage: 'sales',
        timestamp: new Date().toISOString(),
      });
    }, 800);

    return () => clearTimeout(timer);
  }
}, [conversationId, userId, hasShownWelcome, messages.length, sendSystemMessage]);
```

**Test Criteria:**
- [ ] Component compiles without errors
- [ ] Welcome message is sent on mount
- [ ] Only sends once (hasShownWelcome prevents duplicates)
- [ ] Waits for WebSocket connection before sending

---

## Phase 3: Update Backend to Handle System Messages

### Step 3.1: Create System Message Constants (Python)
**File:** `/workspaces/Ilaunching-SERVERS/sales-api/constants/system_messages.py`

**Content:**
```python
"""
System Messages
Pre-written messages that are returned without LLM involvement
"""
import random
from typing import Dict, Any

# System message types
SYSTEM_MESSAGE_TYPES = {
    'SALES_WELCOME': '__SYSTEM_SALES_WELCOME__',
    'STAGE_TRANSITION': '__SYSTEM_STAGE_TRANSITION__',
    'FEATURE_INTRO': '__SYSTEM_FEATURE_INTRO__',
    'PROGRESS_UPDATE': '__SYSTEM_PROGRESS_UPDATE__',
}

# Welcome messages (match frontend)
SALES_WELCOME_MESSAGES = [
    """# Welcome! 🚀

I'm excited to help you **launch your business idea**. 

Let's start by understanding what you're building:

- What **problem** are you trying to solve?
- Who is your **target customer**?
- What makes your solution **unique**?

**Don't worry if you're not sure yet** - we'll figure it out together!

---

*Type your response below and let's get started...*""",

    """# Hey there! 👋

Great to have you here. I'm here to help turn your idea into reality.

Let's dive right in:

### First, tell me about your idea
- What inspired you to start this?
- What specific problem does it solve?
- Who needs this solution the most?

**No pressure** - just share what's on your mind, and we'll build from there!

---

*I'm listening...*""",

    """# Let's Build Something Amazing! ✨

I'm your AI sales consultant, and I'm here to guide you through launching your business.

### To get started, I need to understand:

1. **Your Vision** - What are you trying to create?
2. **The Problem** - What pain point does it address?
3. **Your Customers** - Who will benefit most?

**Think of this as a conversation** - there are no wrong answers!

---

*Share your thoughts below...*""",

    """# Ready to Launch? 🎯

Welcome! I'm here to help you validate, refine, and launch your business idea.

### Let's start with the basics:

- **What's your idea?** (In your own words)
- **Why now?** What makes this the right time?
- **Who's it for?** Your ideal customer

**Remember**: Every great business started with a simple conversation like this one.

---

*Let's begin...*""",

    """# Hi! Let's Talk Business 💡

I'm thrilled to work with you on bringing your idea to life.

### Here's what I need to know first:

> **Your Idea**: What are you planning to build or offer?
> 
> **The Gap**: What problem or need does it address?
> 
> **Your Advantage**: What makes you different from competitors?

**Feeling stuck?** No worries - just tell me what's on your mind, and we'll explore it together!

---

*Start typing below...*"""
]


def get_random_welcome_message() -> str:
    """Get a random welcome message"""
    return random.choice(SALES_WELCOME_MESSAGES)


def get_system_message_response(message_type: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Get system message response based on type
    Returns response in the same format as LLM responses
    """
    metadata = metadata or {}
    
    if message_type == SYSTEM_MESSAGE_TYPES['SALES_WELCOME']:
        return {
            "message": get_random_welcome_message(),
            "stage": "discovery",
            "extracted_data": {},
            "ui_commands": [
                {
                    "tool": "update_conversation_stage",
                    "arguments": {
                        "stage": "discovery",
                        "progress_percentage": 0
                    }
                }
            ]
        }
    
    # Add more system message types here as needed
    
    # Default fallback
    return {
        "message": "Hello! How can I help you today?",
        "stage": "discovery",
        "extracted_data": {},
        "ui_commands": []
    }
```

**Test Criteria:**
- [ ] File created successfully
- [ ] Functions work correctly
- [ ] Returns proper response format

### Step 3.2: Update Sales Service
**File:** `/workspaces/Ilaunching-SERVERS/sales-api/services/sales_service.py`

**Changes:**
```python
from constants.system_messages import SYSTEM_MESSAGE_TYPES, get_system_message_response

async def generate_response_with_ui_control(
    self,
    conversation: SalesConversation,
    user_message: str
) -> Dict[str, Any]:
    """
    Generate AI response WITH UI control commands via MCP
    OR return system message if it's a system message type
    """
    
    # Check if this is a system message
    if user_message in SYSTEM_MESSAGE_TYPES.values():
        print(f"🔔 System message detected: {user_message}")
        return get_system_message_response(user_message)
    
    # Otherwise, continue with normal LLM processing
    print(f"💬 Processing user message: {user_message}")
    
    # ... existing LLM code ...
```

**Test Criteria:**
- [ ] System messages are detected correctly
- [ ] Returns pre-written message without calling LLM
- [ ] Normal messages still go through LLM
- [ ] Response format matches LLM responses

### Step 3.3: Update Message Route
**File:** `/workspaces/Ilaunching-SERVERS/sales-api/routes/message.py`

**No changes needed!** The route already passes the message to `generate_response_with_ui_control`, which will handle system messages.

**Test Criteria:**
- [ ] System messages flow through existing route
- [ ] Streaming works with system messages
- [ ] WebSocket broadcasts correctly

---

## Phase 4: Testing Plan

### Test 4.1: Unit Tests

**Test File:** `/workspaces/Ilaunching-SERVERS/sales-api/tests/test_system_messages.py`

```python
import pytest
from constants.system_messages import (
    SYSTEM_MESSAGE_TYPES,
    get_random_welcome_message,
    get_system_message_response
)

def test_get_random_welcome_message():
    """Test that random welcome message is returned"""
    message = get_random_welcome_message()
    assert isinstance(message, str)
    assert len(message) > 0
    assert "Welcome" in message or "Hey" in message or "Ready" in message or "Hi" in message

def test_get_system_message_response_welcome():
    """Test welcome message response format"""
    response = get_system_message_response(SYSTEM_MESSAGE_TYPES['SALES_WELCOME'])
    
    assert 'message' in response
    assert 'stage' in response
    assert 'extracted_data' in response
    assert 'ui_commands' in response
    
    assert response['stage'] == 'discovery'
    assert isinstance(response['ui_commands'], list)
    assert len(response['ui_commands']) > 0

def test_system_message_types_constant():
    """Test that system message types are defined"""
    assert SYSTEM_MESSAGE_TYPES['SALES_WELCOME'] == '__SYSTEM_SALES_WELCOME__'
```

**Run Tests:**
```bash
cd /workspaces/Ilaunching-SERVERS/sales-api
pytest tests/test_system_messages.py -v
```

**Test Criteria:**
- [ ] All tests pass
- [ ] Response format is correct
- [ ] Random selection works

### Test 4.2: Integration Test

**Manual Test Steps:**

1. **Start Backend:**
   ```bash
   cd /workspaces/Ilaunching-SERVERS/sales-api
   python main.py
   ```

2. **Start Frontend:**
   ```bash
   cd /workspaces/Ilaunching-SERVERS/ilaunching-frontend
   npm run dev
   ```

3. **Test Welcome Message:**
   - Open browser to landing page
   - Complete email + name signup
   - Enter sales stage
   - **Expected:** Welcome message streams in automatically
   - **Verify:** Message appears character-by-character (streaming)
   - **Verify:** No actual LLM API call is made (check logs)

4. **Test Message Format:**
   - **Verify:** Markdown is rendered correctly (headers, bold, lists)
   - **Verify:** Message looks identical to LLM messages
   - **Verify:** User can respond normally after welcome message

5. **Test Multiple Loads:**
   - Refresh page
   - **Verify:** Different welcome message appears (random selection)
   - **Verify:** Only one welcome message per session

**Test Criteria:**
- [ ] Welcome message appears automatically
- [ ] Message streams like LLM response
- [ ] Markdown renders correctly
- [ ] No LLM API call in logs
- [ ] Random selection works
- [ ] Only sends once per session
- [ ] User can respond after welcome message

### Test 4.3: Error Handling Test

**Test Scenarios:**

1. **Network Failure:**
   - Disconnect network during system message send
   - **Expected:** Error logged, no crash
   - **Verify:** User can still interact with UI

2. **Invalid Message Type:**
   - Send unknown system message type
   - **Expected:** Falls back to default message
   - **Verify:** No crash, message still streams

3. **WebSocket Disconnection:**
   - Close WebSocket before system message completes
   - **Expected:** Message send fails gracefully
   - **Verify:** Reconnection works properly

**Test Criteria:**
- [ ] No crashes on errors
- [ ] Graceful fallbacks work
- [ ] User experience is maintained

---

## Phase 5: Documentation & Cleanup

### Step 5.1: Add Usage Documentation

**File:** `/workspaces/Ilaunching-SERVERS/SYSTEM_MESSAGES_USAGE.md`

```markdown
# System Messages Usage Guide

## How to Add New System Messages

1. **Add constant to frontend:**
   - Edit `src/constants/systemMessages.ts`
   - Add new type to `SYSTEM_MESSAGE_TYPES`
   - Add message content

2. **Add constant to backend:**
   - Edit `sales-api/constants/system_messages.py`
   - Add matching type to `SYSTEM_MESSAGE_TYPES`
   - Add message handler in `get_system_message_response`

3. **Send from component:**
   ```typescript
   sendSystemMessage(SYSTEM_MESSAGE_TYPES.YOUR_TYPE, {
     // metadata
   });
   ```

## Examples

### Stage Transition Message
```typescript
sendSystemMessage(SYSTEM_MESSAGE_TYPES.STAGE_TRANSITION, {
  from_stage: 'discovery',
  to_stage: 'validation'
});
```

### Progress Update
```typescript
sendSystemMessage(SYSTEM_MESSAGE_TYPES.PROGRESS_UPDATE, {
  progress: 50,
  milestone: 'Market research complete'
});
```
```

### Step 5.2: Update Main README

Add section to `/workspaces/Ilaunching-SERVERS/README.md`:

```markdown
## System Messages

The app uses a system message mechanism to send pre-written content that streams like LLM responses but doesn't require LLM API calls. This is used for:

- Welcome messages
- Stage transitions
- Feature introductions
- Progress updates

See [SYSTEM_MESSAGES_USAGE.md](SYSTEM_MESSAGES_USAGE.md) for details.
```

---

## Phase 6: Rollout Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] Code reviewed
- [ ] No console errors in browser
- [ ] No Python errors in backend
- [ ] Documentation complete

### Deployment Steps
1. [ ] Deploy backend changes first
2. [ ] Verify backend health check
3. [ ] Deploy frontend changes
4. [ ] Test in production environment
5. [ ] Monitor logs for errors
6. [ ] Verify user experience

### Post-Deployment
- [ ] Welcome messages working in production
- [ ] No performance issues
- [ ] No increase in error rates
- [ ] User feedback positive

---

## Success Metrics

- ✅ Welcome message appears instantly on sales stage entry
- ✅ Message streams smoothly (no lag or stuttering)
- ✅ Zero LLM API calls for system messages
- ✅ Users cannot distinguish system vs LLM messages
- ✅ System can be easily extended with new message types

---

## Future Enhancements

1. **Message Personalization:**
   - Use user data to customize messages
   - Reference previous conversations

2. **A/B Testing:**
   - Test different welcome messages
   - Track which messages get best engagement

3. **Multi-Language Support:**
   - Translate system messages
   - Auto-detect user language

4. **Analytics:**
   - Track system message effectiveness
   - Measure time-to-first-response

5. **Rich Media:**
   - Add images to system messages
   - Include interactive elements
   - Embed videos or demos
