import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const extraElectronBuilderArgs = process.argv.slice(2);

if (process.platform !== "darwin") {
	console.error("[package-macos-arm64] This packaging flow only supports macOS.");
	process.exit(1);
}

if (process.arch !== "arm64") {
	console.error(
		`[package-macos-arm64] This packaging flow only supports Apple Silicon (arm64). Current arch: ${process.arch}`,
	);
	process.exit(1);
}

const steps = [
	{
		command: npmCommand,
		args: ["run", "build:platform-native-helpers"],
		label: "build native helpers",
	},
	{
		command: "tsc",
		args: [],
		label: "typecheck and compile TS",
	},
	{
		command: "vite",
		args: ["build"],
		label: "build renderer and electron bundles",
	},
	{
		command: npmCommand,
		args: ["run", "normalize:electron-main-cjs"],
		label: "normalize electron main bundle",
	},
	{
		command: npmCommand,
		args: ["run", "smoke:electron-main-cjs"],
		label: "smoke test electron main bundle",
	},
	{
		command: "electron-builder",
		args: ["--mac", "--arm64", ...extraElectronBuilderArgs],
		label: "package macOS arm64 artifacts",
	},
];

for (const step of steps) {
	console.log(`[package-macos-arm64] ${step.label}`);
	const result = spawnSync(step.command, step.args, {
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}
