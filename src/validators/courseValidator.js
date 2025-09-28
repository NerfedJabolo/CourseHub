import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  language: z.enum(['en', 'et']), // example languages
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'active', 'archived']),
  capacity: z.number().int().nonnegative().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();
