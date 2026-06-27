# design_skill

`design_skill` is a CLI tool that provides a structured shared vocabulary and automated guardrails to elevate UI/UX quality, preventing AI coding agents from producing generic, predictable designs.

## Installation

You can run `design_skill` locally or install it globally.

To link the package locally:
```bash
npm link
```

## Usage

### 1. Initialize Context
Before running any design commands, you must initialize the context. This sets up the foundational templates (`PRODUCT.md`, `DESIGN.md`, and `.design_skill/skill.md`).

```bash
design_skill init
```
This command will interactively prompt you for project requirements:
- Project Goal
- Target Audience
- Brand Personality
- Typographic Feeling
- Base Color (must be a valid HEX code)

Alternatively, if you run `/design_skill init` in your AI chat interface, the AI agent will ask you these questions directly.

### 2. Available Commands
Once initialized, you can run various commands to iterate on the design.

```bash
design_skill [command]
```

To see all available commands:
```bash
design_skill --help
```

#### `audit`
Evaluate technical frontend quality and accessibility by recursively scanning your source files for design anti-patterns.

```bash
design_skill audit <target-directory>
# Example: design_skill audit ./src
```
If no target is provided, it defaults to looking for a `./src` directory. Exit code is `1` if violations are found, `0` if clean.

### 3. Browser Extension (Live DOM Audit)
The `design_skill` detector engine can also run directly in your browser to catch runtime anti-patterns (such as computed styles or dynamic classes) that static analysis cannot see.

To install the extension:
1. Run the build script to generate the extension package:
   ```bash
   node bin/build-ext.js
   ```
2. Open Google Chrome or Chromium edge and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top right corner).
4. Click **Load unpacked** and select the generated `dist/extension/` directory in this repository.

To use the extension:
- Navigate to your local development server (e.g., `http://localhost:3000`).
- Click the `Design Skill Audit` icon in your browser toolbar to toggle the audit on/off.
- Any violating elements will be outlined with a red bounding box.
- Hover over the red `!` badge in the corner of the box to see the specific design anti-pattern rule that failed.
