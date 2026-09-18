export interface UserSettings {
  id?: string;
  xConnected: boolean;
  xUsername: string;
  linkedinConnected: boolean;
  linkedinUsername: string;
  aiWritingEnabled: boolean;
  defaultPostingTimes: string[];
  n8nWebhookUrl: string;
  geminiApiKey: string;
}

export interface SettingsRow {
  id: string;
  user_id: string;
  x_connected: boolean;
  x_username: string | null;
  x_access_token: string | null;
  x_access_secret: string | null;
  linkedin_connected: boolean;
  linkedin_username: string | null;
  linkedin_access_token: string | null;
  linkedin_refresh_token: string | null;
  linkedin_token_expires_at: string | null;
  linkedin_person_urn: string | null;
  ai_writing_enabled: boolean;
  default_posting_times: string[];
  n8n_webhook_url: string | null;
  openai_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  aiWritingEnabled?: boolean;
  defaultPostingTimes?: string[];
  n8nWebhookUrl?: string;
  geminiApiKey?: string;
}

export const DEFAULT_POSTING_TIMES = [
  "09:00",
  "12:00",
  "15:00",
  "18:00",
  "21:00",
];
