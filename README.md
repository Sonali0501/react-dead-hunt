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

### 1. **Folder to scan for exports** (default: `./src`)

Specify the directory where your components, hooks, and utilities are defined.

### 2. **Folder to scan for usages** (default: `./src`)

Specify the directory where your code is used (usually your main app directory).

### 3. **What do you want to hunt for?**

Select which types of unused code to search for:

- **Components** — PascalCase exports (e.g., `Button`, `UserProfile`)
- **Custom Hooks** — Functions starting with `use` (e.g., `useAuth`, `useFetch`)
- **Utility Functions** — camelCase functions (e.g., `formatDate`, `calculateTotal`)
- **Type Definitions** — TypeScript interfaces and types (e.g., `User`, `ApiResponse`)

## How It Works

React Dead Hunt analyzes your codebase in two passes:

1. **Discovery Pass** — Scans the export directory and identifies all exported components, hooks, functions, and types using AST parsing
2. **Usage Pass** — Checks the search directory for actual usages of each exported item through JSX elements, function calls, and type references

After analysis, the tool displays:

- A table of all unused exports
- The file path where each export is defined
- The type category of each export

## Examples

### Hunt for unused components and hooks only

Run the tool and when prompted:

- **Folder to scan for exports:** `./src`
- **Folder to scan for usages:** `./src`
- **Select:** Components (PascalCase) and Custom Hooks (use...)

### Hunt in a monorepo structure

- **Folder to scan for exports:** `./packages/ui/src`
- **Folder to scan for usages:** `./apps/web/src`
- **Select:** All options

### Find unused TypeScript types

- **Folder to scan for exports:** `./src/types`
- **Folder to scan for usages:** `./src`
- **Select:** Type Definitions (Interfaces/Types)

## Output

The tool displays results as a formatted table showing:

- **Export Name** — The name of the unused export
- **File Path** — Where it's exported from
- **Type** — Component, Hook, Function, or Type

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
