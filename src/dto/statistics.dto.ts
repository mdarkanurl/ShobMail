import { z } from "zod";

export const senderAndSourceInsightsSchema = z.object({
    gmail_limit: z.coerce.number().positive().default(500),
    time_limit: z.string()
        .regex(/^\d+d$/, "Must be a number followed by 'd', e.g. '30d'")
        .default("30d")
        .transform((val) => parseInt(val, 10)),
});

export type SenderAndSourceInsightsDto = z.infer<typeof senderAndSourceInsightsSchema>;
