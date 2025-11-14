/**
 * HTML Streaming Helpers
 * 
 * Utilities for safely parsing and streaming HTML content
 * Ensures tags don't break mid-stream and formatting is preserved
 */

export interface HTMLChunk {
  type: 'text' | 'tag' | 'closingTag';
  content: string;
  isComplete: boolean;
}

/**
 * Parse HTML content into streamable chunks
 * Ensures HTML tags are never broken mid-stream
 */
export function parseHTMLToChunks(html: string): HTMLChunk[] {
  const chunks: HTMLChunk[] = [];
  let buffer = '';
  let inTag = false;
  let tagBuffer = '';
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    if (char === '<') {
      // Save any text buffer before tag
      if (buffer.length > 0) {
        chunks.push({
          type: 'text',
          content: buffer,
          isComplete: true,
        });
        buffer = '';
      }
      
      inTag = true;
      tagBuffer = '<';
    } else if (char === '>' && inTag) {
      // Complete tag
      tagBuffer += '>';
      inTag = false;
      
      // Determine tag type
      const isClosingTag = tagBuffer.startsWith('</');
      chunks.push({
        type: isClosingTag ? 'closingTag' : 'tag',
        content: tagBuffer,
        isComplete: true,
      });
      
      tagBuffer = '';
    } else if (inTag) {
      // Building tag
      tagBuffer += char;
    } else {
      // Building text content
      buffer += char;
    }
  }
  
  // Add any remaining buffer
  if (buffer.length > 0) {
    chunks.push({
      type: 'text',
      content: buffer,
      isComplete: true,
    });
  }
  
  // Handle incomplete tag (malformed HTML)
  if (tagBuffer.length > 0) {
    chunks.push({
      type: 'text',
      content: tagBuffer,
      isComplete: false,
    });
  }
  
  return chunks;
}

/**
 * Split HTML chunks into word-based chunks while preserving tags
 */
export function splitHTMLIntoWords(html: string): string[] {
  const htmlChunks = parseHTMLToChunks(html);
  const wordChunks: string[] = [];
  
  for (const chunk of htmlChunks) {
    if (chunk.type === 'text') {
      // Split text into words, preserving spaces
      // Match: word + optional trailing space, or just spaces
      const words = chunk.content.match(/\S+\s*|\s+/g) || [];
      wordChunks.push(...words);
    } else {
      // Keep tags as single chunks
      wordChunks.push(chunk.content);
    }
  }
  
  return wordChunks;
}

/**
 * Split HTML chunks into character-based chunks while preserving tags
 */
export function splitHTMLIntoCharacters(html: string): string[] {
  const htmlChunks = parseHTMLToChunks(html);
  const charChunks: string[] = [];
  
  for (const chunk of htmlChunks) {
    if (chunk.type === 'text') {
      // Split text into characters
      charChunks.push(...chunk.content.split(''));
    } else {
      // Keep tags as single chunks
      charChunks.push(chunk.content);
    }
  }
  
  return charChunks;
}

/**
 * Validate HTML structure
 * Returns array of unclosed tags if any
 */
export function validateHTMLStructure(html: string): string[] {
  const tagStack: string[] = [];
  const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  
  const htmlChunks = parseHTMLToChunks(html);
  
  for (const chunk of htmlChunks) {
    if (chunk.type === 'tag') {
      // Extract tag name
      const match = chunk.content.match(/<(\w+)/);
      if (match) {
        const tagName = match[1].toLowerCase();
        
        // Check if self-closing
        if (!selfClosingTags.includes(tagName) && !chunk.content.endsWith('/>')) {
          tagStack.push(tagName);
        }
      }
    } else if (chunk.type === 'closingTag') {
      // Extract tag name
      const match = chunk.content.match(/<\/(\w+)/);
      if (match) {
        const tagName = match[1].toLowerCase();
        
        // Check if matches last opened tag
        if (tagStack.length > 0 && tagStack[tagStack.length - 1] === tagName) {
          tagStack.pop();
        } else {
          console.warn(`HTML validation: Unexpected closing tag </${tagName}>`);
        }
      }
    }
  }
  
  return tagStack; // Returns unclosed tags
}

/**
 * Sanitize HTML for safe streaming
 * Removes dangerous tags and attributes
 */
export function sanitizeHTMLForStreaming(html: string): string {
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'style'];
  const dangerousAttrs = ['onerror', 'onclick', 'onload', 'onmouseover'];
  
  let sanitized = html;
  
  // Remove dangerous tags
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove dangerous attributes
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
}

/**
 * Get streaming strategy based on content analysis
 */
export function getStreamingStrategy(html: string): {
  hasHTML: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  recommendedMode: 'word' | 'character';
  recommendedChunkSize: number;
} {
  const chunks = parseHTMLToChunks(html);
  const tagCount = chunks.filter(c => c.type === 'tag' || c.type === 'closingTag').length;
  const textLength = chunks.filter(c => c.type === 'text').reduce((sum, c) => sum + c.content.length, 0);
  
  const hasHTML = tagCount > 0;
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  
  if (tagCount > 20 || textLength > 5000) {
    complexity = 'complex';
  } else if (tagCount > 5 || textLength > 1000) {
    complexity = 'moderate';
  }
  
  return {
    hasHTML,
    complexity,
    recommendedMode: hasHTML ? 'word' : 'character',
    recommendedChunkSize: complexity === 'complex' ? 3 : complexity === 'moderate' ? 2 : 1,
  };
}
