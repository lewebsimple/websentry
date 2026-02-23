import * as z from "zod";
import { Drivers, drivers } from "../drivers";

export const driverNameSchema = z.enum(
  Object.keys(drivers) as [keyof Drivers, ...(keyof Drivers)[]],
);
export type DriverName = z.infer<typeof driverNameSchema>;

export const pipelineNameSchema = z.string().brand<"PipelineName">();
export type PipelineName = z.infer<typeof pipelineNameSchema>;

export const sourceNameSchema = z.string().brand<"SourceName">();
export type SourceName = z.infer<typeof sourceNameSchema>;
