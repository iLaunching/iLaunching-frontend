# 🔧 Tiptap Extension Architecture & API Requirements

## 📚 **Tiptap Extension Development Framework**

Based on comprehensive research, here's the complete architecture for building our streaming system:

### 🏗️ **Extension Architecture Fundamentals**

#### **1. Extension Base Structure**
```typescript
import { Extension } from '@tiptap/core'

const StreamingExtension = Extension.create({
  name: 'streaming',
  
  // Extension lifecycle
  onCreate() {
    console.log('Extension initialized')
    this.setupStreamingState()
  },
  
  onUpdate() {
    // Called on every document change
    this.handleDocumentUpdate()
  },
  
  onDestroy() {
    // Cleanup streaming sessions
    this.cleanupStreams()
  },
  
  // Add custom commands
  addCommands() {
    return {
      streamContent: (content, options) => ({ editor }) => {
        return this.initiateStreaming(editor, content, options)
      }
    }
  },
  
  // Add global attributes
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          streaming: {
            default: false,
            parseHTML: element => element.hasAttribute('data-streaming'),
            renderHTML: attributes => ({
              'data-streaming': attributes.streaming
            })
          }
        }
      }
    ]
  }
})
```

#### **2. Command System Architecture**
```typescript
// TypeScript command declarations
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streaming: {
      // Core streaming commands
      startStream: (config: StreamConfig) => ReturnType
      writeChunk: (chunk: string, position?: number) => ReturnType
      finishStream: (streamId?: string) => ReturnType
      pauseStream: () => ReturnType
      resumeStream: () => ReturnType
      
      // Advanced commands
      streamWithAnimation: (content: string, animationType: string) => ReturnType
      batchWrite: (chunks: string[]) => ReturnType
      streamToNode: (nodeId: string, content: string) => ReturnType
    }
  }
}

// Command implementation
addCommands() {
  return {
    startStream: (config: StreamConfig) => ({ editor, tr }) => {
      // Initialize streaming session
      const streamId = this.streamManager.create(config)
      
      // Setup streaming node at position
      const position = config.position ?? editor.state.doc.content.size
      this.insertStreamingNode(tr, position, streamId)
      
      return true
    },
    
    writeChunk: (chunk: string, position?: number) => ({ editor, tr }) => {
      // Performance-optimized chunk writing
      const pos = position ?? this.findActiveStreamPosition(editor)
      
      // Use transaction for atomic updates
      tr.insertText(chunk, pos)
      
      // Trigger animations
      this.triggerChunkAnimation(chunk, pos)
      
      return true
    }
  }
}
```

#### **3. Custom Node Development**
```typescript
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

const StreamingNode = Node.create({
  name: 'streamingNode',
  group: 'block',
  content: 'inline*',
  draggable: false,
  isolating: true,
  
  addAttributes() {
    return {
      streamId: { default: null },
      isActive: { default: false },
      chunkCount: { default: 0 },
      animationType: { default: 'wave' }
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-streaming-node]' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-streaming-node': '',
      class: 'streaming-content'
    }), 0]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(StreamingNodeComponent)
  },
  
  addCommands() {
    return {
      insertStreamingNode: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs
        })
      }
    }
  }
})

// React component for streaming node
const StreamingNodeComponent = ({ node, updateAttributes, editor }) => {
  const [chunks, setChunks] = useState([])
  
  useEffect(() => {
    // Listen for streaming events
    const streamId = node.attrs.streamId
    
    editor.on(`stream:chunk:${streamId}`, (chunk) => {
      setChunks(prev => [...prev, chunk])
    })
    
    return () => {
      editor.off(`stream:chunk:${streamId}`)
    }
  }, [node.attrs.streamId])
  
  return (
    <NodeViewWrapper className="streaming-node">
      {chunks.map((chunk, index) => (
        <span 
          key={index}
          className="streaming-chunk"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {chunk}
        </span>
      ))}
    </NodeViewWrapper>
  )
}
```

### 🚀 **API Requirements & Architecture**

#### **1. Streaming API Server**
```typescript
// Express + Socket.IO setup
import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ['websocket', 'polling']
})

// Streaming session management
class StreamingSessionManager {
  private sessions = new Map<string, StreamingSession>()
  
  async createSession(userId: string, config: StreamConfig): Promise<string> {
    const sessionId = generateUUID()
    const session = new StreamingSession(sessionId, userId, config)
    
    this.sessions.set(sessionId, session)
    return sessionId
  }
  
  async startStreaming(sessionId: string, prompt: string) {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Session not found')
    
    // Initialize AI streaming
    const aiStream = await this.aiService.createStream(prompt)
    
    // Process chunks and emit to client
    for await (const chunk of aiStream) {
      session.emit('chunk', {
        content: chunk.content,
        timestamp: Date.now(),
        metadata: chunk.metadata
      })
      
      // Rate limiting and backpressure
      if (session.shouldPause()) {
        await session.waitForResume()
      }
    }
    
    session.emit('complete')
  }
}

// API endpoints
app.post('/api/streaming/session', async (req, res) => {
  try {
    const { userId, config } = req.body
    const sessionId = await sessionManager.createSession(userId, config)
    
    res.json({ 
      sessionId, 
      wsEndpoint: `/ws/stream/${sessionId}` 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/streaming/:sessionId/start', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { prompt } = req.body
    
    // Start streaming asynchronously
    sessionManager.startStreaming(sessionId, prompt)
    
    res.json({ status: 'started' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// WebSocket handling
io.on('connection', (socket) => {
  socket.on('join-stream', (sessionId) => {
    const session = sessionManager.getSession(sessionId)
    if (session) {
      session.addClient(socket)
      socket.join(`stream-${sessionId}`)
    }
  })
  
  socket.on('pause-stream', (sessionId) => {
    const session = sessionManager.getSession(sessionId)
    if (session) session.pause()
  })
  
  socket.on('resume-stream', (sessionId) => {
    const session = sessionManager.getSession(sessionId)
    if (session) session.resume()
  })
})
```

#### **2. AI Service Integration**
```typescript
interface AIProvider {
  createStream(prompt: string, config: StreamConfig): AsyncGenerator<AIChunk>
}

class OpenAIStreamingProvider implements AIProvider {
  async* createStream(prompt: string, config: StreamConfig): AsyncGenerator<AIChunk> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    })
    
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield {
          content,
          metadata: {
            model: 'gpt-4',
            tokens: chunk.usage?.total_tokens
          }
        }
      }
    }
  }
}

class AnthropicStreamingProvider implements AIProvider {
  async* createStream(prompt: string, config: StreamConfig): AsyncGenerator<AIChunk> {
    const response = await anthropic.messages.stream({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
    
    for await (const chunk of response) {
      if (chunk.type === 'content_block_delta') {
        yield {
          content: chunk.delta.text,
          metadata: { model: 'claude-3-sonnet' }
        }
      }
    }
  }
}
```

### 🔌 **Frontend Integration Layer**

#### **1. WebSocket Service**
```typescript
class StreamingWebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  
  async connect(sessionId: string): Promise<void> {
    this.socket = io(`ws://localhost:3001/stream/${sessionId}`, {
      transports: ['websocket'],
      timeout: 5000
    })
    
    this.setupEventHandlers()
    
    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        resolve()
      })
      
      this.socket!.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        reject(error)
      })
    })
  }
  
  private setupEventHandlers() {
    this.socket!.on('chunk', (data) => {
      // Emit to streaming extension
      window.dispatchEvent(new CustomEvent('streaming:chunk', {
        detail: data
      }))
    })
    
    this.socket!.on('complete', () => {
      window.dispatchEvent(new CustomEvent('streaming:complete'))
    })
    
    this.socket!.on('disconnect', () => {
      this.handleReconnect()
    })
  }
  
  private async handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.pow(2, this.reconnectAttempts) * 1000
      
      setTimeout(() => {
        console.log(`Reconnect attempt ${this.reconnectAttempts}`)
        this.socket?.connect()
      }, delay)
    }
  }
}
```

#### **2. React Hook for Streaming**
```typescript
interface UseStreamingOptions {
  editor: Editor
  onChunk?: (chunk: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
  animationType?: 'wave' | 'fade' | 'slide'
  speed?: number
}

export function useStreaming(options: UseStreamingOptions) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const wsService = useRef(new StreamingWebSocketService())
  
  const startStreaming = async (prompt: string, config?: StreamConfig) => {
    try {
      setIsStreaming(true)
      
      // Create streaming session
      const response = await fetch('/api/streaming/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          config: config || { animationType: options.animationType }
        })
      })
      
      const { sessionId: newSessionId } = await response.json()
      setSessionId(newSessionId)
      
      // Connect WebSocket
      await wsService.current.connect(newSessionId)
      
      // Start streaming command in editor
      options.editor.commands.startStream({
        sessionId: newSessionId,
        animationType: options.animationType || 'wave',
        speed: options.speed || 50
      })
      
      // Start server-side streaming
      await fetch(`/api/streaming/${newSessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      
    } catch (error) {
      console.error('Streaming error:', error)
      setIsStreaming(false)
      options.onError?.(error as Error)
    }
  }
  
  // Listen for streaming events
  useEffect(() => {
    const handleChunk = (event: CustomEvent) => {
      const { content, metadata } = event.detail
      
      // Write to editor
      options.editor.commands.writeChunk(content)
      
      // Call hook callback
      options.onChunk?.(content)
    }
    
    const handleComplete = () => {
      setIsStreaming(false)
      options.editor.commands.finishStream()
      options.onComplete?.()
    }
    
    window.addEventListener('streaming:chunk', handleChunk as EventListener)
    window.addEventListener('streaming:complete', handleComplete)
    
    return () => {
      window.removeEventListener('streaming:chunk', handleChunk as EventListener)
      window.removeEventListener('streaming:complete', handleComplete)
    }
  }, [options.editor])
  
  return {
    isStreaming,
    sessionId,
    startStreaming,
    pauseStreaming: () => options.editor.commands.pauseStream(),
    resumeStreaming: () => options.editor.commands.resumeStream()
  }
}
```

### 🎯 **Next Steps for Implementation**

1. **Phase 1**: Start with the Tiptap extension architecture
2. **Phase 2**: Build the basic API server with WebSocket support
3. **Phase 3**: Implement the React integration layer
4. **Phase 4**: Add AI service providers and advanced features
5. **Phase 5**: Performance optimization and production deployment

This architecture provides a solid foundation for building a production-ready streaming system that rivals premium solutions while being fully customizable and extensible.