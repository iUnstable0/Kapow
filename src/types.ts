import * as z from "zod";

export const Z_Playlist = z.enum([
  "hiphop",
  "coffee",
  "blueberry",
  "cisco",
  "all",
]);

export type T_Playlist = z.infer<typeof Z_Playlist>;

export const Z_MaxLevel = z.coerce.number().min(1).max(5);

export const Z_FlashcardsMode = z.enum(["new", "old"]);
export type T_FlashcardsMode = z.infer<typeof Z_FlashcardsMode>;
