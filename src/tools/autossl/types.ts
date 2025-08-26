import { z } from 'zod';

export const AutosslListArgsSchema = z.object({
  domain: z.string().optional(),
});

export const AutosslInstallArgsSchema = z.object({
  user: z.string().min(1, 'User is required'),
  domain: z.string().min(1, 'Domain is required'),
});

export const AutosslRenewArgsSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
});

export const AutosslDeleteArgsSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
});

export type AutosslListArgs = z.infer<typeof AutosslListArgsSchema>;
export type AutosslInstallArgs = z.infer<typeof AutosslInstallArgsSchema>;
export type AutosslRenewArgs = z.infer<typeof AutosslRenewArgsSchema>;
export type AutosslDeleteArgs = z.infer<typeof AutosslDeleteArgsSchema>;