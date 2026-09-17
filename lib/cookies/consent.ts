export const COOKIE_CONSENT_KEY = "pp_cookie_consent";
export const COOKIE_CONSENT_EVENT = "pp:cookie-consent";
export const COOKIE_CONSENT_OPEN_EVENT = "pp:open-cookie-consent";

export type CookieConsentValue = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  decidedAt: string;
  version: 1;
};

export const DEFAULT_CONSENT: CookieConsentValue = {
  essential: true,
  preferences: false,
  analytics: false,
  decidedAt: "",
  version: 1,
};

export function parseCookieConsent(
  raw: string | null | undefined,
): CookieConsentValue | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentValue>;
    if (parsed.version !== 1) return null;
    return {
      essential: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      decidedAt:
        typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
      version: 1,
    };
  } catch {
    return null;
  }
}

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;

  const fromStorage = parseCookieConsent(
    window.localStorage.getItem(COOKIE_CONSENT_KEY),
  );
  if (fromStorage) return fromStorage;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_CONSENT_KEY}=`));
  if (!match) return null;

  try {
    return parseCookieConsent(decodeURIComponent(match.split("=")[1] ?? ""));
  } catch {
    return null;
  }
}

export function writeCookieConsent(value: CookieConsentValue): void {
  if (typeof window === "undefined") return;

  const payload: CookieConsentValue = {
    ...value,
    essential: true,
    decidedAt: value.decidedAt || new Date().toISOString(),
    version: 1,
  };
  const encoded = JSON.stringify(payload);

  window.localStorage.setItem(COOKIE_CONSENT_KEY, encoded);

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(encoded)}; path=/; max-age=${maxAge}; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: payload }),
  );
}

export function hasAnalyticsConsent(consent?: CookieConsentValue | null) {
  return Boolean(consent?.analytics);
}

export function hasPreferencesConsent(consent?: CookieConsentValue | null) {
  return Boolean(consent?.preferences);
}
