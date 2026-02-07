import * as z from "zod";

export const sourceIdSchema = z.string().brand<"SourceId">();
export type SourceId = z.infer<typeof sourceIdSchema>;

export const pipelineIdSchema = z.string().brand<"PipelineId">();
export type PipelineId = z.infer<typeof pipelineIdSchema>;

export const driverNameSchema = z.enum(["cheerio"]);
export type DriverName = z.infer<typeof driverNameSchema>;
