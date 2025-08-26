import { z } from 'zod';

export const PackageListArgsSchema = z.object({});

export type PackageListArgs = z.infer<typeof PackageListArgsSchema>;