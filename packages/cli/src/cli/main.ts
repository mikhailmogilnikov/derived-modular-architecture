import { runCli } from "./run";

const code = await runCli(process.argv.slice(2));
process.exit(code);
