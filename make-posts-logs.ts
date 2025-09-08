#!/usr/bin/env -S node --experimental-strip-types

import { exec } from "child_process";
import fs from "fs/promises";

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
		'git log --reverse --format="tformat:%H %at %s" --diff-filter=M -- ' + path,
	).then(({ stdout }) =>
		stdout.split("\n").map(parseGitLine).filter(Boolean),
	)) as GitRef[];

	return { creation, updates };
}

async function main() {
	const basePath = "src/content/blog";
	const files = await fs.readdir(basePath, {
		encoding: "utf8",
		recursive: false,
	});
	const gitEntries: Record<string, {}> = {};
	for (const file of files) {
		const path = `${basePath}/${file}`;
		const git = await gitLog(path).catch(() => ({
			creation: null,
			updates: [],
		}));
		gitEntries[path] = { ...git, path };
	}
	await fs.writeFile(
		"posts-logs.json",
		JSON.stringify(gitEntries, undefined, 2),
		{
			encoding: "utf8",
		},
	);
}

main();
