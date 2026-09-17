export type PlatformSettings = {
  appName: string;
  supportEmail: string;
  signupsOpen: boolean;
  maintenanceMode: boolean;
  aiWritingEnabled: boolean;
  updatedAt: string;
};

export type PlatformSettingsUpdate = {
  appName: string;
  supportEmail: string;
  signupsOpen: boolean;
  maintenanceMode: boolean;
  aiWritingEnabled: boolean;
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  appName: "Postpilot",
  supportEmail: "support@postpilot.app",
  signupsOpen: true,
  maintenanceMode: false,
  aiWritingEnabled: true,
  updatedAt: new Date(0).toISOString(),
};
