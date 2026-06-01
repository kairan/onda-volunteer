import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type InviteUserByEmailOptions = {
  redirectTo: string;
};

export type SupabaseAdminInviteClient = {
  inviteUserByEmail: (
    email: string,
    options: InviteUserByEmailOptions,
  ) => Promise<void>;
};

@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private client: SupabaseClient | null = null;
  private inviteClientOverride: SupabaseAdminInviteClient | null = null;

  /** Test-only: inject a mock invite client. */
  setInviteClientForTests(client: SupabaseAdminInviteClient | null): void {
    this.inviteClientOverride = client;
  }

  async inviteUserByEmail(
    email: string,
    options: InviteUserByEmailOptions,
  ): Promise<void> {
    const client = this.inviteClientOverride ?? this.getInviteClient();
    if (!client) {
      throw new ServiceUnavailableException({
        code: 'SUPABASE_ADMIN_NOT_CONFIGURED',
        message:
          'SUPABASE_SERVICE_ROLE_KEY is not configured; cannot send admin invites.',
      });
    }
    await client.inviteUserByEmail(email, options);
  }

  private getInviteClient(): SupabaseAdminInviteClient | null {
    if (this.inviteClientOverride) {
      return this.inviteClientOverride;
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
    if (!serviceRoleKey || !projectRef) {
      return null;
    }

    if (!this.client) {
      this.client = createClient(
        `https://${projectRef}.supabase.co`,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
    }

    return {
      inviteUserByEmail: async (email, { redirectTo }) => {
        const { error } = await this.client!.auth.admin.inviteUserByEmail(email, {
          redirectTo,
        });
        if (error) {
          throw error;
        }
      },
    };
  }

  logMissingServiceRoleIfNeeded(): void {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return;
    }
    this.logger.warn(
      'SUPABASE_SERVICE_ROLE_KEY is unset; admin email invites will return SUPABASE_ADMIN_NOT_CONFIGURED.',
    );
  }
}
