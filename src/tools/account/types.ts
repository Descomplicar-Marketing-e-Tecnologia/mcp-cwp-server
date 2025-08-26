import { z } from 'zod';

export const AccountCreateArgsSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Valid email is required'),
  package: z.string().min(1, 'Package is required'),
  server_ips: z.string().optional(),
  inode: z.number().positive().optional(),
  limit_nproc: z.number().positive().optional(),
  limit_nofile: z.number().positive().optional(),
  autossl: z.boolean().optional().default(false),
  backup: z.boolean().optional().default(true),
});

export const AccountUpdateArgsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  package: z.string().optional(),
  email: z.string().email().optional(),
  quota: z.number().positive().optional(),
  bandwidth: z.number().positive().optional(),
  autossl: z.boolean().optional(),
  backup: z.boolean().optional(),
});

export const AccountDeleteArgsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export const AccountSuspendArgsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  reason: z.string().optional(),
});

export const AccountPasswordResetArgsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const AccountInfoArgsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export const AccountListArgsSchema = z.object({
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional(),
  search: z.string().optional(),
});

export type AccountCreateArgs = z.infer<typeof AccountCreateArgsSchema>;
export type AccountUpdateArgs = z.infer<typeof AccountUpdateArgsSchema>;
export type AccountDeleteArgs = z.infer<typeof AccountDeleteArgsSchema>;
export type AccountSuspendArgs = z.infer<typeof AccountSuspendArgsSchema>;
export type AccountPasswordResetArgs = z.infer<typeof AccountPasswordResetArgsSchema>;
export type AccountInfoArgs = z.infer<typeof AccountInfoArgsSchema>;
export type AccountListArgs = z.infer<typeof AccountListArgsSchema>;

export const AccountQuotaArgsSchema = AccountInfoArgsSchema;
export const AccountMetadataArgsSchema = AccountInfoArgsSchema;

export type AccountQuotaArgs = z.infer<typeof AccountQuotaArgsSchema>;
export type AccountMetadataArgs = z.infer<typeof AccountMetadataArgsSchema>;


// MCP Guide: Defensive type for API responses
export const CwpAccountSchema = z.object({
  id: z.string().default(''),
  username: z.string().default(''),
  domain: z.string().default(''),
  email: z.string().default(''),
  package_id: z.string().default(''),
  disk_usage: z.string().default('0'),
  disk_limit: z.string().default('0'),
  bw_usage: z.string().default('0'),
  bw_limit: z.string().default('0'),
  status: z.string().default('unknown'),
});

export type CwpAccount = z.infer<typeof CwpAccountSchema>;
