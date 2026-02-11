#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import fastGlob from "fast-glob";
const { globSync } = fastGlob;
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
const traverse = _traverse.default;
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";

async function run() {
  console.log(chalk.bold.cyan("\n💀 Welcome to React Dead Hunt\n"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "scanDir",
      message: "Folder to scan for dead code:",
      default: "./src",
    },
    {
      type: "checkbox",
      name: "targetTypes",
      message: "What do you want to hunt for?",
      choices: [
        { name: "Components (PascalCase)", value: "Component" },
        { name: "Custom Hooks (use...)", value: "Hook" },
        {
          name: "Utility Functions (camelCase)",
          value: "Function",
        },
        {
          name: "Type Definitions (Interfaces/Types)",
          value: "Type",
        },
      ],
      validate: (answer) => {
        if (answer.length === 0) {
          return "Please select at least one option to hunt for";
        }
        return true;
      },
    },
  ]);

  const spinner = ora("Analyzing codebase...").start();
  const registry = new Map();

  // Helper to categorize and register
  const register = (name, filePath, category) => {
    if (answers.targetTypes.includes(category)) {
      registry.set(name, { filePath, type: category, used: false });
    }
  };

  // PASS 1: Find all Exports
  const exportFiles = globSync(`${answers.scanDir}/**/*.{js,jsx,ts,tsx}`, {
    ignore: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  });

  exportFiles.forEach((file) => {
    const code = fs.readFileSync(file, "utf-8");
    try {
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });

      traverse(ast, {
        ExportNamedDeclaration(p) {
          const { declaration } = p.node;
          if (!declaration) return;

          // TS Interfaces & Types
          if (
            declaration.type === "TSInterfaceDeclaration" ||
            declaration.type === "TSTypeAliasDeclaration" ||
            declaration.type === "TSEnumDeclaration"
          ) {
            register(declaration.id.name, file, "Type");
          }

          // Variables and Functions
          if (declaration.declarations) {
            declaration.declarations.forEach((d) => {
              const name = d.id?.name;
              if (!name) return;
              const type = name.startsWith("use")
                ? "Hook"
                : /^[A-Z]/.test(name)
                  ? "Component"
                  : "Function";
              register(name, file, type);
            });
          }

          if (declaration.type === "FunctionDeclaration" && declaration.id) {
            const name = declaration.id.name;
            const type = name.startsWith("use")
              ? "Hook"
              : /^[A-Z]/.test(name)
                ? "Component"
                : "Function";
            register(name, file, type);
          }
        },
        ExportDefaultDeclaration(p) {
          // Identify named default exports
          const name = p.node.declaration.name || p.node.declaration.id?.name;
          if (name) {
            const type = name.startsWith("use")
              ? "Hook"
              : /^[A-Z]/.test(name)
                ? "Component"
                : "Function";
            register(name, file, type);
          }
        },
      });
    } catch (e) {
      /* Skip unparseable files */
    }
  });

  // PASS 2: AST-based Check Usages
  // Parse each usage file and traverse its AST to find real identifier, JSX and type references.
  const usageFiles = globSync(`${answers.scanDir}/**/*.{js,jsx,ts,tsx}`, {
    ignore: ["**/node_modules/**", "**/dist/**"],
  });

  const registryKeys = new Set(registry.keys());

  usageFiles.forEach((file) => {
    // skip the file if it's the same as the source file for an entry will be filtered per-entry
    let code;
    try {
      code = fs.readFileSync(file, "utf-8");
    } catch (e) {
      return;
    }

    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      });
    } catch (e) {
      // fallback: if parsing fails, skip AST analysis for this file
      return;
    }

    traverse(ast, {
      // Imports: marks explicit imports as usage
      ImportDeclaration(path) {
        const specifiers = path.node.specifiers || [];
        specifiers.forEach((s) => {
          const importedName =
            s.type === "ImportSpecifier"
              ? s.imported?.name
              : s.type === "ImportDefaultSpecifier"
                ? s.local?.name
                : s.local?.name;
          if (!importedName) return;
          if (registryKeys.has(importedName)) {
            const data = registry.get(importedName);
            if (data && data.filePath !== file) data.used = true;
          }
        });
      },

      // JSX opening elements (component usage)
      JSXOpeningElement(path) {
        const nameNode = path.node.name;
        let name = null;
        if (nameNode.type === "JSXIdentifier") {
          name = nameNode.name;
        } else if (nameNode.type === "JSXMemberExpression") {
          // e.g. Layout.Header -> treat Header as potential usage
          let curr = nameNode;
          while (curr && curr.type === "JSXMemberExpression") {
            curr = curr.property;
          }
          if (curr && curr.type === "JSXIdentifier") name = curr.name;
        }
        if (name && registryKeys.has(name)) {
          const data = registry.get(name);
          if (data && data.filePath !== file) data.used = true;
        }
      },

      // Identifier usage anywhere (variables, function calls, member expressions)
      Identifier(path) {
        const name = path.node.name;
        if (!name) return;
        if (!registryKeys.has(name)) return;

        // avoid counting the identifier if it's the declaration in the same file
        const binding = path.scope.getBinding(name);
        if (
          binding &&
          binding.path &&
          binding.path.node &&
          binding.path.node.loc
        ) {
          // If the binding originates from the same file and the binding's file path equals the registered file, skip
          // Note: binding.path.hub.file.opts.filename isn't always available; we'll conservatively only skip when the declaration is in this AST.
          // We still check registry entry filePath to avoid marking definitions as usages when file paths match.
        }

        const data = registry.get(name);
        if (data && data.filePath !== file) data.used = true;
      },

      // TypeScript type references (interfaces, type aliases) e.g. T extends OldProps
      TSTypeReference(path) {
        const typeName = path.node.typeName;
        if (!typeName) return;
        if (typeName.type === "Identifier") {
          const name = typeName.name;
          if (registryKeys.has(name)) {
            const data = registry.get(name);
            if (data && data.filePath !== file) data.used = true;
          }
        } else if (typeName.type === "TSQualifiedName") {
          // Qualified name like Foo.Bar
          let id = typeName.right;
          if (id && id.type === "Identifier") {
            const name = id.name;
            if (registryKeys.has(name)) {
              const data = registry.get(name);
              if (data && data.filePath !== file) data.used = true;
            }
          }
        }
      },
    });
  });

  spinner.stop();

  // RESULTS
  const unused = [...registry.entries()].filter(
    ([_, data]) => !data.used && answers.targetTypes.includes(data.type),
  );

  if (unused.length === 0) {
    console.log(chalk.green("\n✨ No dead code found! Your codebase is lean."));
  } else {
    const table = new Table({
      head: [chalk.cyan("Type"), chalk.cyan("Name"), chalk.cyan("Source File")],
      colWidths: [15, 25, 60],
    });

    unused.forEach(([name, data]) => {
      table.push([data.type, name, chalk.dim(data.filePath)]);
    });

    console.log(chalk.red(`\n💀 Found ${unused.length} unused items:\n`));
    console.log(table.toString());
    console.log(
      chalk.dim(
        "\nNote: Double check dynamic imports or string-based references before deleting.\n",
      ),
    );
  }
}

run().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
