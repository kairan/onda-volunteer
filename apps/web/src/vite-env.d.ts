/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEMO_EVENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
