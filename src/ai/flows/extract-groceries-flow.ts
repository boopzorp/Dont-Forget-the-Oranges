
'use server';
/**
 * @fileOverview An AI flow for extracting grocery items from an image.
 *
 * - extractGroceriesFromImage - A function that handles the grocery extraction process.
 * - ExtractGroceriesInput - The input type for the flow.
 * - ExtractedGroceryItem - The type for a single extracted grocery item.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { CATEGORIES } from '@/lib/data';

// Get just the names of the categories for the enum
const categoryNames = CATEGORIES.map(c => c.name) as [string, ...string[]];

const ExtractGroceriesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a grocery list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractGroceriesInput = z.infer<typeof ExtractGroceriesInputSchema>;

const ExtractedGroceryItemSchema = z.object({
  name: z.string().describe('The name of the grocery item.'),
  category: z.enum(categoryNames).describe('The category of the grocery item.'),
});
export type ExtractedGroceryItem = z.infer<typeof ExtractedGroceryItemSchema>;

const ExtractGroceriesOutputSchema = z.array(ExtractedGroceryItemSchema);


export async function extractGroceriesFromImage(input: ExtractGroceriesInput): Promise<ExtractedGroceryItem[]> {
  const result = await extractGroceriesFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'extractGroceriesPrompt',
  input: { schema: ExtractGroceriesInputSchema },
  output: { schema: ExtractGroceriesOutputSchema },
  prompt: `You are an expert at reading handwritten or digital grocery lists from images.
Your task is to analyze the provided image, identify each distinct grocery item, and classify it into one of the following categories: ${categoryNames.join(', ')}.

- Identify each item on the list.
- Ignore any quantities, prices, or other notes. Focus only on the item name.
- For each item, choose the most appropriate category from the provided list.
- If an item doesn't fit well into any category, classify it as 'Other'.
- Return the data as a JSON array of objects, where each object has a "name" and "category" key, according to the output schema.
- Do not return items that are not groceries (e.g. "My Grocery List", "Weekly Shop", numbers, etc).

Image to process: {{media url=photoDataUri}}`,
});

const extractGroceriesFlow = ai.defineFlow(
  {
    name: 'extractGroceriesFlow',
    inputSchema: ExtractGroceriesInputSchema,
    outputSchema: ExtractGroceriesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // The prompt should always return an array, but we safeguard against null/undefined output
    return output ?? [];
  }
);
