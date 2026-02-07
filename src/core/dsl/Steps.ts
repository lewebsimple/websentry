import * as z from "zod";

import { pipelineIdSchema } from "../../types";

/**
 * Crawl step
 */

export const crawlStepSchema = z.object({
  op: z.literal("crawl"),
  selector: z.string(),
  pipeline: pipelineIdSchema,
});

/**
 * Extraction steps
 */

// Extract attribute step schema
export const extractAttrStepSchema = z.object({
  op: z.literal("extractAttr"),
  selector: z.string(),
  attr: z.string(),
  as: z.string(),
});
export type ExtractAttrStep = z.infer<typeof extractAttrStepSchema>;

// Extract text step schema
export const extractTextStepSchema = z.object({
  op: z.literal("extractText"),
  selector: z.string(),
  as: z.string(),
});
export type ExtractTextStep = z.infer<typeof extractTextStepSchema>;

// Extract HTML step schema
export const extractHtmlStepSchema = z.object({
  op: z.literal("extractHtml"),
  selector: z.string(),
  as: z.string(),
});
export type ExtractHtmlStep = z.infer<typeof extractHtmlStepSchema>;

/**
 * Emit step
 */

export const emitStepSchema = z.object({
  op: z.literal("emit"),
});

/**
 * Step union
 */

export const stepSchema = z.discriminatedUnion("op", [
  crawlStepSchema,
  extractAttrStepSchema,
  extractTextStepSchema,
  extractHtmlStepSchema,
  emitStepSchema,
]);
export type Step = z.infer<typeof stepSchema>;
