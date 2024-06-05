import { z } from "zod";

export const Boundary = z.object({
  swlat: z.number(),
  swlng: z.number(),
  nelat: z.number(),
  nelng: z.number(),
});
export type TBoundary = z.infer<typeof Boundary>;
