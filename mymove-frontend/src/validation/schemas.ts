import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
});

export const registerSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  phone: z.string().optional(),
});

export const createMoveRequestSchema = z.object({
  originAddress: z.string().min(5, 'Adresse zu kurz').max(500),
  destinationAddress: z.string().min(5, 'Adresse zu kurz').max(500),
  moveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum im Format YYYY-MM-DD'),
  floorsOrigin: z.number().int().min(0).max(50).optional(),
  floorsDestination: z.number().int().min(0).max(50).optional(),
  elevator: z.boolean().optional(),
  parkingDistance: z.number().int().min(0).max(500).optional(),
  extras: z.object({
    assemblyRequired: z.boolean().optional(),
    boxesNeeded: z.boolean().optional(),
    noParkingZoneRequired: z.boolean().optional(),
  }).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateMoveRequestInput = z.infer<typeof createMoveRequestSchema>;
