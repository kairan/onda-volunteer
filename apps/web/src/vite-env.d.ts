/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEMO_EVENT_ID?: string;
  readonly VITE_DEMO_MINISTRY_ID?: string;
  readonly VITE_DEMO_VOLUNTEER_ID?: string;
  readonly VITE_DEMO_ROLE_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_AUTH_USE_DEV_HEADERS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
