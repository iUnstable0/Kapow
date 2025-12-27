import * as z from "zod";

export const Z_PlaylistEnum = z.enum([
  "hiphop",
  "coffee",
  "blueberry",
  "cisco",
  "all",
]);

export type T_Playlist = z.infer<typeof Z_PlaylistEnum>;

export const Z_MaxLevel = z.coerce.number().min(1).max(5);
