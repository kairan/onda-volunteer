import { createServerFn } from "@tanstack/react-start";

export const TEST_USER_EMAIL = "test@onda.app";
export const TEST_USER_PASSWORD = "TestUser123!";

export const ensureTestUser = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Check if user exists
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) throw new Error(listErr.message);
  const existing = list.users.find((u) => u.email === TEST_USER_EMAIL);
  if (existing) return { ok: true, created: false };

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  return { ok: true, created: true };
});
