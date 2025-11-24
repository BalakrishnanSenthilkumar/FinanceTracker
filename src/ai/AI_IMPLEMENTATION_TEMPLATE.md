# AI Implementation Template

This document outlines the pattern for implementing AI features in this architecture.

## Architecture Pattern

### 1. **Engine Layer** (`src/ai/engines/`)

- **BaseAIEngine**: Abstract base class defining the AI engine interface
- **LocalLLMEngine**: On-device AI using TFLite models (Gemma, Phi-3)
- **CloudAIEngine**: Cloud-based AI (OpenAI, Anthropic)
- **EngineFactory**: Creates and switches between engines

### 2. **Processor Layer** (`src/ai/processors/`)

- Task-specific processors (CategoryProcessor, QueryProcessor, etc.)
- Each processor handles a specific AI task
- Processors use engines through the base interface

### 3. **Extension Layer** (`src/ai/extensions/`)

- Extension points for plug-in architecture
- CategoryManager.setStrategy()
- InsightsManager.registerSource()
- QueryEngine.registerProcessor()

### 4. **Feature Integration** (`src/features/*/ai-integration.ts`)

- Connects UI to AI processors
- Handles feature-specific AI logic
- Manages state and error handling

## Implementation Steps

### Step 1: Define Types (`src/ai/types/`)

```typescript
// Define interfaces for your AI feature
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

### Step 2: Create Processor (`src/ai/processors/`)

```typescript
// Implement processor that uses engine
class QueryProcessor {
  constructor(private engine: BaseAIEngine) {}

  async process(query: string): Promise<string> {
    // Use engine to process query
  }
}
```

### Step 3: Create Extension Point (`src/ai/extensions/`)

```typescript
// Register processor in extension point
QueryEngine.registerProcessor('chat', queryProcessor);
```

### Step 4: Feature Integration (`src/features/*/ai-integration.ts`)

```typescript
// Connect UI to AI
export const useChatAI = () => {
  const engine = EngineFactory.create('local');
  const processor = new QueryProcessor(engine);

  return {
    sendMessage: async (message: string) => {
      return await processor.process(message);
    },
  };
};
```

### Step 5: UI Component (`src/features/*/index.tsx`)

```typescript
// Use AI integration in UI
const ChatScreen = () => {
  const { sendMessage } = useChatAI();
  // Render chat UI
};
```

## Example: Chat Feature with Gemma 3B

1. **Engine**: LocalLLMEngine loads Gemma 3B TFLite model
2. **Processor**: QueryProcessor handles chat queries
3. **Extension**: QueryEngine manages chat processors
4. **Integration**: useChatAI hook connects UI to AI
5. **UI**: ChatScreen renders chat interface

