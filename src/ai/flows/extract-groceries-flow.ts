
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
      "A photo of a grocery list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractGroceriesInput = z.infer<typeof ExtractGroceriesInputSchema>;

const ExtractedGroceryItemSchema = z.object({
  name: z.string().describe('The name of the grocery item.'),
  category: z.enum(categoryNames).describe('The category of the grocery item.'),
  price: z.number().optional().describe('The price of a single unit of the grocery item. If not available, do not include this field.'),
  quantity: z.number().optional().describe('The quantity of the grocery item. Defaults to 1 if not specified.'),
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
Your task is to analyze the provided image, identify each distinct grocery item, its quantity, its price, and classify it into one of the following categories: ${categoryNames.join(', ')}.

- Identify each item on the list.
- Extract a concise, clean name for the item. The goal is to remove brand names and descriptive words unless they are essential. For example:
  - "iD Homestyle Whole Wheat Paratha" should become "Whole Wheat Paratha".
  - "Britannia 100% Whole Wheat Bread" should become "Whole Wheat Bread".
  - "Heritage Cup Curd" should become "Curd".
  - "Daawat Basmati Rice" should become "Basmati Rice".
  - "Safal Frozen Mixed Vegetables" should become "Mixed Vegetables".
  - For simple items like "Egg", "Tomato", "Paneer", "Green Chilli", use just that single word.
  - For uniquely branded items where the brand is the common name, like "Munch chocolate", "Kitkat", or "Cheetos", use the brand and product name.
- Extract the quantity for each item. Look for multipliers like "x 2", "x 1", etc. The number after the 'x' is the quantity. If a quantity is not explicitly mentioned, assume it is 1.
- Extract the price for each item if it's available.
- **VERY IMPORTANT**: If an item's quantity is greater than 1, the listed price is likely the total for all units. You MUST calculate the per-unit price by dividing the total price by the quantity. The 'price' field in your output must be the price for a single unit. For example, if "Aam Panna Mango Drink" is listed as "200 ml x 2" for "₹76", the quantity is 2 and the per-unit price is 38.
- Ignore any other notes. Focus only on the item name, price, and quantity.
- For each item, choose the most appropriate category from the provided list.
- Items like "Chips", "Chocolates", "Beverages" should be categorized as 'Snacks'.
- If an item doesn't fit well into any category, classify it as 'Other'.
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
