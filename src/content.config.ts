import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { exec } from "child_process";

type GitRef = { hash: string; date: Date; message: string };
type Git = { creation: GitRef | null; updates: GitRef[] };
export type GitData = { git: Git };

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

function parseGitLine(line: string): GitRef | null {
	if (line.length === 0) return null;
	const [hash, date, ...message] = line.trim().split(" ");
	return {
		hash,
		date: new Date(Number(date) * 1000),
		message: message.join(" "),
	};
}

async function gitLog(path: string): Promise<Git> {
	const creation = await execAsync(
		'git log --format="tformat:%H %at %s" --diff-filter=A -- ' + path,
	).then(({ stdout }) => parseGitLine(stdout.split("\n")[0]));

	const updates = (await execAsync(
		'git log --format="tformat:%H %at %s" --diff-filter=M -- ' + path,
	).then(({ stdout }) =>
		stdout.split("\n").map(parseGitLine).filter(Boolean),
	)) as GitRef[];

	return { creation, updates };
}

const loaderMiddleware = () => {
	const loader = glob({
		base: "./src/content/blog",
		pattern: import.meta.env.DEV ? "**/*.{md,mdx}" : "**/!(*.draft){md,mdx}",
	});
	const oldLoad = loader.load;
	loader.load = async (ctx) => {
		await oldLoad(ctx);
		for (const [key, value] of ctx.store.entries()) {
			const git = await gitLog(value.filePath!).catch(() => ({
				creation: null,
				updates: [],
			}));
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
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
		}),
});

export const collections = { blog };
