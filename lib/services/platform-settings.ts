import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type PlatformSettings,
  type PlatformSettingsUpdate,
} from "@/lib/types/platform-settings";

const BUCKET = "app-config";
const OBJECT_PATH = "platform-settings.json";
const CACHE_TTL_MS = 8_000;

export class PlatformSettingsError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PlatformSettingsError";
  }
}

type StoredRow = {
  app_name?: string;
  support_email?: string;
  signups_open?: boolean;
  maintenance_mode?: boolean;
  ai_writing_enabled?: boolean;
  updated_at?: string;
};

let memoryCache: { at: number; value: PlatformSettings } | null = null;

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function normalize(row: StoredRow | null | undefined): PlatformSettings {
  return {
    appName:
      typeof row?.app_name === "string" && row.app_name.trim()
        ? row.app_name.trim()
        : DEFAULT_PLATFORM_SETTINGS.appName,
    supportEmail:
      typeof row?.support_email === "string" && row.support_email.trim()
        ? row.support_email.trim()
        : DEFAULT_PLATFORM_SETTINGS.supportEmail,
    signupsOpen:
      typeof row?.signups_open === "boolean"
        ? row.signups_open
        : DEFAULT_PLATFORM_SETTINGS.signupsOpen,
    maintenanceMode:
      typeof row?.maintenance_mode === "boolean"
        ? row.maintenance_mode
        : DEFAULT_PLATFORM_SETTINGS.maintenanceMode,
    aiWritingEnabled:
      typeof row?.ai_writing_enabled === "boolean"
        ? row.ai_writing_enabled
        : DEFAULT_PLATFORM_SETTINGS.aiWritingEnabled,
    updatedAt:
      typeof row?.updated_at === "string"
        ? row.updated_at
        : new Date().toISOString(),
  };
}

function toStored(input: PlatformSettingsUpdate): StoredRow {
  return {
    app_name: input.appName.trim() || DEFAULT_PLATFORM_SETTINGS.appName,
    support_email:
      input.supportEmail.trim() || DEFAULT_PLATFORM_SETTINGS.supportEmail,
    signups_open: input.signupsOpen,
    maintenance_mode: input.maintenanceMode,
    ai_writing_enabled: input.aiWritingEnabled,
    updated_at: new Date().toISOString(),
  };
}

async function ensureBucket(): Promise<void> {
  const supabase = getServiceClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    throw new PlatformSettingsError(error.message);
  }
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: false,
  });
  if (createError && !/already exists/i.test(createError.message)) {
    throw new PlatformSettingsError(createError.message);
  }
}

async function readFromStorage(): Promise<PlatformSettings> {
  await ensureBucket();
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(OBJECT_PATH);

  if (error) {
    if (
      /not found|404|Object not found/i.test(error.message) ||
      error.message.includes("The resource was not found")
    ) {
      const defaults = {
        ...DEFAULT_PLATFORM_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
      await writeToStorage({
        appName: defaults.appName,
        supportEmail: defaults.supportEmail,
        signupsOpen: defaults.signupsOpen,
        maintenanceMode: defaults.maintenanceMode,
        aiWritingEnabled: defaults.aiWritingEnabled,
      });
      return defaults;
    }
    throw new PlatformSettingsError(error.message);
  }

  const text = await data.text();
  try {
    return normalize(JSON.parse(text) as StoredRow);
  } catch {
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  }
}

async function writeToStorage(
  input: PlatformSettingsUpdate,
): Promise<PlatformSettings> {
  await ensureBucket();
  const stored = toStored(input);
  const supabase = getServiceClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(OBJECT_PATH, JSON.stringify(stored, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    throw new PlatformSettingsError(error.message);
  }

  return normalize(stored);
}

/** Fast cached read for proxy / hot paths. */
export async function getPlatformSettingsCached(): Promise<PlatformSettings> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < CACHE_TTL_MS) {
    return memoryCache.value;
  }

  try {
    const value = await readFromStorage();
    memoryCache = { at: now, value };
    return value;
  } catch (error) {
    console.error("getPlatformSettingsCached failed:", error);
    return memoryCache?.value ?? {
      ...DEFAULT_PLATFORM_SETTINGS,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const value = await readFromStorage();
  memoryCache = { at: Date.now(), value };
  return value;
}

export async function updatePlatformSettings(
  input: PlatformSettingsUpdate,
): Promise<PlatformSettings> {
  if (!input.appName.trim()) {
    throw new PlatformSettingsError("App name is required.");
  }
  if (!input.supportEmail.trim()) {
    throw new PlatformSettingsError("Support email is required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.supportEmail.trim())) {
    throw new PlatformSettingsError("Enter a valid support email.");
  }

  const value = await writeToStorage(input);
  memoryCache = { at: Date.now(), value };
  return value;
}

export function invalidatePlatformSettingsCache(): void {
  memoryCache = null;
}
