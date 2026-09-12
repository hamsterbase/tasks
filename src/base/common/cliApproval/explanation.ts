import { z } from 'zod';

export const cliExplanationSchema = z
  .object({
    text: z.string(),
    images: z.array(
      z
        .object({
          filename: z.string(),
          mimetype: z.string(),
          base64: z.string(),
        })
        .strict()
    ),
  })
  .strict();

export type CliExplanation = z.infer<typeof cliExplanationSchema>;
export type CliExplanationImage = CliExplanation['images'][number];
