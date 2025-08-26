import { z } from 'zod';

export const FtpListArgsSchema = z.object({
  user: z.string().min(1, 'User is required'),
});

export const FtpCreateArgsSchema = z.object({
  user: z.string().min(1, 'User is required'),
  username: z.string().min(1, 'FTP username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  path: z.string().optional(),
  quota: z.number().positive().optional(),
});

export const FtpDeleteArgsSchema = z.object({
  user: z.string().min(1, 'User is required'),
  username: z.string().min(1, 'FTP username is required'),
});

export type FtpListArgs = z.infer<typeof FtpListArgsSchema>;
export type FtpCreateArgs = z.infer<typeof FtpCreateArgsSchema>;
export type FtpDeleteArgs = z.infer<typeof FtpDeleteArgsSchema>;

export const FtpUpdatePermissionsArgsSchema = z.object({
  user: z.string().min(1, 'User is required'),
  username: z.string().min(1, 'FTP username is required'),
  path: z.string().optional(),
  quota: z.number().positive().optional(),
});

export type FtpUpdatePermissionsArgs = z.infer<typeof FtpUpdatePermissionsArgsSchema>;

export const CwpFtpAccountSchema = z.object({
  username: z.string(),
  user: z.string(),
  path: z.string(),
  quota: z.string(),
});

export type CwpFtpAccount = z.infer<typeof CwpFtpAccountSchema>;