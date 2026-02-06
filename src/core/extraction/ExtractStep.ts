import * as z from "zod";

import { documentHandlerNames } from "./DocumentHandler";

/**
 * Fetch step
 */

export const fetchStepSchema = z.object({
  action: z.literal("fetch"),
  handler: z.enum(documentHandlerNames),
});
export type FetchStep = z.infer<typeof fetchStepSchema>;

/**
 * Crawl step
 */

export const crawlStepSchema = z.object({
  action: z.literal("crawl"),
  selector: z.string(),
  role: z.string(),
});

/**
 * Extraction steps
 */

// Extract text step schema
export const extractTextStepSchema = z.object({
  action: z.literal("extractText"),
  name: z.string(),
  selector: z.string(),
});
export type ExtractTextStep = z.infer<typeof extractTextStepSchema>;

// Extract HTML step schema
export const extractHtmlStepSchema = z.object({
  action: z.literal("extractHtml"),
  name: z.string(),
  selector: z.string(),
});
export type ExtractHtmlStep = z.infer<typeof extractHtmlStepSchema>;

/**
 * Commit step
 */

export const commitStepSchema = z.object({
  action: z.literal("commit"),
});

/**
 * ExtractStep union
 */

export const extractStepSchema = z.discriminatedUnion("action", [
  fetchStepSchema,
  crawlStepSchema,
  extractTextStepSchema,
  extractHtmlStepSchema,
  commitStepSchema,
]);
export type ExtractStep = z.infer<typeof extractStepSchema>;
