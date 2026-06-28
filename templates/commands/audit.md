# audit

Instruct the user to run the audit command in their terminal to evaluate the technical frontend quality and accessibility of the source code.

1. Ask the user to run: `npx RENKIN audit <target>` (or `node bin/cli.js audit <target>`). Note: `<target>` should be their source directory, e.g. `./src`.
2. Wait for the user to paste the output.
3. Once the user provides the output, read the results and suggest specific code changes to fix any surfaced design anti-patterns.
