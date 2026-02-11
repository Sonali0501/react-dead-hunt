# React Dead Hunt

> Find and eliminate unused React components, hooks, utilities, and types in your codebase with an interactive CLI.

**React Dead Hunt** scans your React project to identify dead code that's no longer being used. It helps you maintain a clean, efficient codebase by pinpointing exports that can be safely removed.

## Features

- 🎯 **Finds Unused Code** — Detects unused React components, custom hooks, utility functions, and TypeScript types
- 🔍 **Intelligent Analysis** — Uses AST parsing to accurately identify exports and their usages across your codebase
- 🎨 **Interactive CLI** — User-friendly prompts to configure what to search for and where
- 📊 **Clear Reports** — Displays results in an organized table for easy review
- 🚀 **Fast & Efficient** — Quickly analyzes large codebases with glob-based file scanning

## Installation

Install the package globally to use it as a command-line tool:

```bash
npm install -g react-dead-hunt
```

Or use it with `npx` without installing:

```bash
npx react-dead-hunt
```

## Usage

Start the interactive CLI by running:

```bash
react-dead-hunt
```

The tool will prompt you with the following questions:

### 1. **Folder to scan for dead code** (default: `./src`)

Specify the directory to scan for both exports and usages. The tool will analyze all JavaScript/TypeScript files in this directory.

### 2. **What do you want to hunt for?**

Select which types of unused code to search for (required — select at least one):

- ☐ **Components** — PascalCase exports (e.g., `Button`, `UserProfile`)
- ☐ **Custom Hooks** — Functions starting with `use` (e.g., `useAuth`, `useFetch`)
- ☐ **Utility Functions** — camelCase functions (e.g., `formatDate`, `calculateTotal`)
- ☐ **Type Definitions** — TypeScript interfaces and types (e.g., `User`, `ApiResponse`)

Use **spacebar** to toggle selections, then press **Enter** to proceed.

## How It Works

React Dead Hunt analyzes your codebase in two passes:

1. **Discovery Pass** — Scans the specified directory and identifies all exported components, hooks, functions, and types using AST parsing (based on your selections)
2. **Usage Pass** — Checks the same directory for actual usages of each exported item through JSX elements, function calls, and type references

After analysis, the tool displays:

- A table of all unused exports
- The file path where each export is defined
- The type category of each export

## Examples

### Hunt for unused components and hooks only

Run the tool and when prompted:

- **Folder to scan for dead code:** `./src`
- **Select:** Components (PascalCase) and Custom Hooks (use...)

### Hunt for all types of unused code

- **Folder to scan for dead code:** `./src`
- **Select:** All options (Components, Hooks, Functions, Types)

### Find unused utility functions only

- **Folder to scan for dead code:** `./src/utils`
- **Select:** Utility Functions (camelCase)

## Output

The tool displays results as a formatted table showing:

- **Type** — Component, Hook, Function, or Type
- **Name** — The name of the unused export
- **Source File** — Where it's defined

## What Gets Detected

✅ Named exports and default exports  
✅ React components (JSX)  
✅ Custom hooks (functions starting with `use`)  
✅ Utility and helper functions  
✅ TypeScript interfaces, types, and enums  
✅ Usage in JSX elements, function calls, and type annotations

## Notes

- The tool intelligently skips over files in `node_modules`, `dist`, and `.d.ts` declaration files
- Files must be valid JavaScript or TypeScript to be analyzed (unparseable files are silently skipped)
- Re-exports are supported — if a component is re-exported, it won't be marked as unused
- The tool respects your directory structure and glob patterns

## License

MIT

---

Keep your React codebase lean and mean! 💀
