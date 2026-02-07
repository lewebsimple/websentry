import * as z from "zod";

function defineSignal<T extends string, V extends z.ZodTypeAny>(type: T, value: V) {
  return z.object({
    type: z.literal(type),
    value,
  });
}

// Text signal
export const textSignalSchema = defineSignal("text", z.string());
export type TextSignal = z.infer<typeof textSignalSchema>;

// HTML signal
export const htmlSignalSchema = defineSignal("html", z.string());
export type HtmlSignal = z.infer<typeof htmlSignalSchema>;

// Union of all signal types
export const signalSchema = z.discriminatedUnion("type", [textSignalSchema, htmlSignalSchema]);
export type Signal = z.infer<typeof signalSchema>;
export type SignalType = Signal["type"];

export const itemSchema = z.object({
  uri: z.url(),
  signals: z.record(z.string(), signalSchema),
});
export type Item = z.infer<typeof itemSchema>;
