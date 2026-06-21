import { describe, expect, it, vi } from 'vitest';
import * as supabaseModule from '@/supabaseClient';

describe('getAccessToken', () => {
  it('returns null when Supabase client is not configured', async () => {
    vi.spyOn(supabaseModule, 'getSupabaseClient').mockReturnValue(null);
    await expect(supabaseModule.getAccessToken()).resolves.toBeNull();
  });
});
