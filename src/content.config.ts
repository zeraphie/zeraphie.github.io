import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const posts = (base: string) =>
	defineCollection({
		loader: glob({ pattern: "**/*.md", base }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			icon: z.string().optional(),
			draft: z.boolean().default(false),
		}),
	});

export const collections = {
	dnd: posts("./src/content/dnd"),
	projects: posts("./src/content/projects"),
	lyrics: posts("./src/content/lyrics"),
	guides: posts("./src/content/guides"),
	about: posts("./src/content/about"),
};
