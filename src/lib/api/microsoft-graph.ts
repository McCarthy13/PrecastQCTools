/**
 * Microsoft Graph API Integration (Web Stub)
 *
 * The original mobile implementation relied on Expo modules that are not
 * available in the web build. To keep the application deployable, we provide
 * placeholder functions that surface a clear error when unexpected calls are
 * made. Once the web-friendly auth flow is implemented, these stubs can be
 * replaced with a real Microsoft identity platform integration.
 */

const UNSUPPORTED_MESSAGE =
  'Microsoft Graph authentication is not available in the web deployment. Please implement a web-compatible flow before calling this function.';

export interface GraphAPIToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface EmailParams {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
}

export function isGraphConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_AZURE_AD_CLIENT_ID &&
      process.env.EXPO_PUBLIC_AZURE_AD_TENANT_ID,
  );
}

export async function authenticateWithMicrosoft(): Promise<GraphAPIToken> {
  throw new Error(UNSUPPORTED_MESSAGE);
}

export async function sendEmailViaGraphAPI(_params: EmailParams): Promise<void> {
  throw new Error(UNSUPPORTED_MESSAGE);
}
