import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { exec } from "child_process";
import { resolveAny } from "dns";

async function execAsync(
	command: string,
): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolve, reject) => {
		exec(command, (err, stdout, stderr) => {
			if (err) reject(err);
			resolve({ stdout, stderr });
		});
	});
}

async function git(path: string) {
	const { stdout } = await execAsync(
		'git log --format="tformat:%H %at %s" --diff-filter=AM -- ' + path,
	);
	console.log("Git result:", stdout);
}

const loaderMiddleware = () => {
	const loader = glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" });
	const oldLoad = loader.load;
	loader.load = async (ctx) => {
		const res = await oldLoad(ctx);
		for (const value of ctx.store.values()) {
			console.log(value.filePath);
			await git(value.filePath!);
		}
		return res;
	};
	return loader;
};

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: loaderMiddleware(),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

export const collections = { blog };
