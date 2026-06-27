# `/renkin init` Command Instructions

When the user invokes `/renkin init`, your goal is to gather project requirements and populate `PRODUCT.md` and `DESIGN.md`.

## Workflow
1. Ask the user the following questions sequentially (or all at once if appropriate):
   - What is the Project Goal?
   - Who is the Target Audience?
   - What is the Brand Lane (e.g., playful, corporate, minimalist)?
   - Describe the typographic feeling you're after (e.g., editorial serif, technical monospace, humanist sans).
   - What is the Base Color? (Ask for a hex code).
2. Once gathered, write out the `PRODUCT.md` and `DESIGN.md` files according to their schemas.
3. **IMPORTANT**: Ensure that the Base Color provided is formatted as a valid hex code (e.g. `#FFFFFF`).
4. **IMPORTANT**: In `PRODUCT.md`, you MUST include the YAML frontmatter block at the very top:
   ```yaml
   ---
   renkin_initialized: true
   ---
   ```
