export interface Configuration {
  shopifyShopUrl: string;
  shopifyClientId: string;
  shopifyClientSecret: string;
  shopifyScope: string;
  shopifyApiVersion: string;
  tracezillaBaseUrl: string;
  tracezillaTeamSlug: string;
  tracezillaApiKey: string;
  timeoutMs: number;
}

export function configurationFromEnvironment(env: NodeJS.ProcessEnv): Configuration {
  const shopifyShopUrl = shopDomain(required(env, "SHOPIFY_SHOP_URL"));
  const timeoutMs = Number.parseInt(required(env, "HTTP_TIMEOUT_MS"), 10);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error("HTTP_TIMEOUT_MS must be a positive integer.");
  }

  return {
    shopifyShopUrl,
    shopifyClientId: required(env, "SHOPIFY_CLIENT_ID"),
    shopifyClientSecret: required(env, "SHOPIFY_CLIENT_SECRET"),
    shopifyScope: required(env, "SHOPIFY_SCOPE"),
    shopifyApiVersion: required(env, "SHOPIFY_API_VERSION"),
    tracezillaBaseUrl: required(env, "TRACEZILLA_BASE_URL").replace(/\/$/, ""),
    tracezillaTeamSlug: required(env, "TRACEZILLA_TEAM_SLUG"),
    tracezillaApiKey: required(env, "TRACEZILLA_API_KEY"),
    timeoutMs,
  };
}

function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing required configuration: ${key}`);
  return value;
}

function shopDomain(value: string): string {
  const domain = value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (!domain.endsWith(".myshopify.com") || domain.includes("/")) {
    throw new Error("SHOPIFY_SHOP_URL must look like your-store.myshopify.com.");
  }
  return domain;
}
