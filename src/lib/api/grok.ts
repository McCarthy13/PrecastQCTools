import type { ChatCompletionResponse, ChatCompletionRequest } from './openai';

interface GrokClient {
  chat: {
    completions: {
      create: (payload: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
    };
  };
}

const GROK_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

export const getGrokClient = (): GrokClient => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY;
  if (!apiKey) {
    console.warn('Grok API key not found in environment variables');
    return {
      chat: {
        completions: {
          async create() {
            throw new Error('Grok API key is not configured.');
          },
        },
      },
    };
  }

  return {
    chat: {
      completions: {
        async create(payload: ChatCompletionRequest): Promise<ChatCompletionResponse> {
          const response = await fetch(GROK_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
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
            throw new Error(`Grok request failed: ${errorText}`);
          }

          return (await response.json()) as ChatCompletionResponse;
        },
      },
    },
  };
};
