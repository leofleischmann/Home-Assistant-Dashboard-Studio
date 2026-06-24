/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HASS_URL: string;
  readonly VITE_HASS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
