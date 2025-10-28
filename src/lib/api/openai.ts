export type ChatMessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
      | Record<string, unknown>
    >;

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: ChatMessageContent;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

type ChatCompletionChoice = {
  message: {
    content: string;
  };
};

export type ChatCompletionResponse = {
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type ChatCompletionClient = {
  create: (payload: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
};

interface OpenAIClient {
  chat: {
    completions: ChatCompletionClient;
  };
}

class OpenAIHttpClient implements OpenAIClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  chat = {
    completions: {
      create: async (payload: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: payload.model,
            messages: payload.messages,
            temperature: payload.temperature,
            max_tokens: payload.max_tokens,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI request failed: ${errorText}`);
        }

        const data = (await response.json()) as ChatCompletionResponse;
        return data;
      },
    },
  };
}

export const getOpenAIClient = (): OpenAIClient => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not found in environment variables');
    return {
      chat: {
        completions: {
          async create() {
            throw new Error('OpenAI API key is not configured.');
          },
        },
      },
    };
  }
  return new OpenAIHttpClient(apiKey);
};
