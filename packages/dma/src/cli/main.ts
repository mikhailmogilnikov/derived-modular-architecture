#!/usr/bin/env bun
import { runCli } from "./run";

process.exit(runCli(process.argv.slice(2)));
