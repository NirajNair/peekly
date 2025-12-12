import { z } from 'zod';
import { Mode } from '../enums/mode.enum';

export const QueryRequestDto = z.object({
  mode: z.enum([Mode.Quick, Mode.Detailed]),
  userText: z.string(),
  userPrompt: z.string(),
});

export const QueryResponseDto = z.object({
  response: z.string(),
});

export type QueryRequestDto = z.infer<typeof QueryRequestDto>;
export type QueryResponseDto = z.infer<typeof QueryResponseDto>;
