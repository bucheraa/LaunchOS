export interface IntegrationConfig {
  provider: string;
  credentials: Record<string, string>;
}

export interface IntegrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AppStoreListing {
  appId: string;
  name: string;
  subtitle?: string;
  description: string;
  promotionalText?: string;
  keywords?: string[];
  locale: string;
}

export interface PlayStoreListing {
  packageName: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  locale: string;
}
