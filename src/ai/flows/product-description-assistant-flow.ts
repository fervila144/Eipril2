'use server';
/**
 * @fileOverview An AI assistant for generating concise and attractive product descriptions in Spanish.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  keywords: z.array(z.string()).describe('A list of keywords related to the product.'),
  details: z.string().describe('Basic details or features of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A concise and attractive product description in Spanish.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return productDescriptionAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productDescriptionAssistantPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `Eres un asistente de marketing experto en crear descripciones de productos concisas y atractivas.

Genera una descripción de producto en español, utilizando el nombre del producto, las palabras clave y los detalles proporcionados.
La descripción debe ser persuasiva, destacar los puntos clave del producto y tener un tono adecuado para un catálogo minimalista.

Nombre del Producto: {{{productName}}}
Palabras Clave: {{#each keywords}}- {{{this}}}{{/each}}
Detalles: {{{details}}}`,
});

const productDescriptionAssistantFlow = ai.defineFlow(
  {
    name: 'productDescriptionAssistantFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
