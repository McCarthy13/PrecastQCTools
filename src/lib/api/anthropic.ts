type AnthropicMessageInput = {
  role: 'user' | 'assistant';
  content: string;
};

type AnthropicRequestPayload = {
  model: string;
  messages: AnthropicMessageInput[];
  max_tokens: number;
  temperature?: number;
};

type AnthropicResponseContent = { type: 'text'; text: string } | Record<string, unknown>;

type AnthropicResponse = {
  content: AnthropicResponseContent[];
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  [key: string]: unknown;
};

type AnthropicClient = {
  messages: {
    create: (payload: AnthropicRequestPayload) => Promise<AnthropicResponse>;
  };
};

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const missingKeyClient: AnthropicClient = {
  messages: {
    async create() {
      throw new Error('Anthropic API key is not configured.');
    },
  },
};

export const getAnthropicClient = (): AnthropicClient => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('Anthropic API key not found in environment variables');
    return missingKeyClient;
  }

  return {
    messages: {
      async create(payload: AnthropicRequestPayload) {
        const response = await fetch(ANTHROPIC_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': ANTHROPIC_VERSION,
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            model: payload.model,
            max_tokens: payload.max_tokens,
            temperature: payload.temperature,
            messages: payload.messages.map((message) => ({
              role: message.role,
              content: [{ type: 'text', text: message.content }],
            })),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Anthropic request failed: ${errorText}`);
        }

        const data = (await response.json()) as AnthropicResponse;
        return data;
      },
    },
  };
};
