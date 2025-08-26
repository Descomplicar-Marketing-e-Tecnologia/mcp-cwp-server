import { z } from 'zod';

export const CwpConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  sslVerify: z.boolean().default(false),
  debug: z.boolean().default(false),
  port: z.number().default(2304),
});

export type CwpConfig = z.infer<typeof CwpConfigSchema>;

export interface CwpResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface CwpApiError {
  code: string;
  message: string;
  details?: unknown;
}

export const AccountCreateSchema = z.object({
  domain: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(8),
  email: z.string().email(),
  package: z.string().min(1),
  server_ips: z.string().optional(),
  inode: z.number().optional(),
  limit_nproc: z.number().optional(),
  limit_nofile: z.number().optional(),
  autossl: z.boolean().optional().default(false),
  backup: z.boolean().optional().default(true),
});

export type AccountCreateRequest = z.infer<typeof AccountCreateSchema>;

export const DomainCreateSchema = z.object({
  user: z.string().min(1),
  type: z.enum(['addon', 'subdomain', 'parked']),
  name: z.string().min(1),
  path: z.string().optional(),
  autossl: z.boolean().optional().default(false),
});

export type DomainCreateRequest = z.infer<typeof DomainCreateSchema>;

export const EmailCreateSchema = z.object({
  domain: z.string().min(1),
  email: z.string().min(1),
  password: z.string().min(6),
  quota: z.number().optional(),
});

export type EmailCreateRequest = z.infer<typeof EmailCreateSchema>;

export const FtpCreateSchema = z.object({
  domain: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6),
  path: z.string().optional(),
  quota: z.number().optional(),
});

export type FtpCreateRequest = z.infer<typeof FtpCreateSchema>;

export const MysqlCreateSchema = z.object({
  domain: z.string().min(1),
  database_name: z.string().min(1),
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
});

export type MysqlCreateRequest = z.infer<typeof MysqlCreateSchema>;

export const CronjobCreateSchema = z.object({
  domain: z.string().min(1),
  minute: z.string().default('*'),
  hour: z.string().default('*'),
  day: z.string().default('*'),
  month: z.string().default('*'),
  weekday: z.string().default('*'),
  command: z.string().min(1),
});

export type CronjobCreateRequest = z.infer<typeof CronjobCreateSchema>;