import * as z from "zod";

export const PlaylistEnum = z.enum([
  "hiphop",
  "coffee",
  "blueberry",
  "cisco",
  "all",
]);

export type T_Playlist = z.infer<typeof PlaylistEnum>;
