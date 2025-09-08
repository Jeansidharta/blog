import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import postsLogs from "../posts-logs.json";

type GitRef = { hash: string; date: Date; message: string };
type Git = { creation: GitRef | null; updates: GitRef[] };
export type GitData = { git: Git };

const loaderMiddleware = () => {
	const loader = glob({
		base: "./src/content/blog",
		pattern: import.meta.env.DEV ? "**/*.{md,mdx}" : "**/!(*.draft){md,mdx}",
	});
	const oldLoad = loader.load;
	loader.load = async (ctx) => {
		await oldLoad(ctx);
		for (const [key, value] of ctx.store.entries()) {
			const git = value.filePath
				? (postsLogs[value.filePath as keyof typeof postsLogs] ?? {})
				: {};

			ctx.store.delete(key);
			ctx.store.set({ ...value, data: { ...value.data, git } });
		}
	};
	return loader;
};

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: loaderMiddleware(),
	// Type-check frontmatter using a schema
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
		}),
});

export const collections = { blog };
