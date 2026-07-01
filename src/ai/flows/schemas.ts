/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileOverview Zod schemas and TypeScript types for AI flows.
 * This file does not contain 'use server' and can be safely imported
 * in both server and client components.
 */

import { z } from 'zod';

export const GenerateBackgroundInputSchema = z.object({
    city: z.string().describe('The name of the city for which to generate a background image.'),
    weather: z.string().describe('A brief description of the current weather (e.g., "Clear sky", "Light rain").'),
    country: z.string().optional().describe('The country where the city is located.'),
    adminArea: z.string().optional().describe('The administrative area (state, province) where the city is located.'),
});
export type GenerateBackgroundInput = z.infer<typeof GenerateBackgroundInputSchema>;

export const GenerateBackgroundOutputSchema = z.object({
    image: z.string().describe("A data URI of the generated image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateBackgroundOutput = z.infer<typeof GenerateBackgroundOutputSchema>;
