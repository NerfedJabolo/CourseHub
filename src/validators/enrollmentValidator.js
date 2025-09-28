import { z } from 'zod';

export const updateEnrollmentSchema = z.object({
  action: z.enum(['approve', 'cancel']),
});
