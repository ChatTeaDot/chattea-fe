import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const sourceRoot = resolve(projectRoot, "src");
const configPath = resolve(projectRoot, "tsconfig.json");

const getCompilerOptions = (): ts.CompilerOptions => {
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));

  return ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot).options;
};

const getModuleSpecifiers = (sourceFile: ts.SourceFile): string[] => {
  const specifiers: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text);
    }

    if (ts.isCallExpression(node)) {
      const [argument] = node.arguments;
      if (
        argument &&
        ts.isStringLiteral(argument) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require"))
      ) {
        specifiers.push(argument.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specifiers;
};

const findUnreachableSourceFiles = (): string[] => {
  const compilerOptions = getCompilerOptions();
  const sourceFiles = ts.sys
    .readDirectory(sourceRoot, [".ts", ".tsx"], undefined, undefined)
    .map((fileName) => resolve(fileName))
    .filter((fileName) => !fileName.endsWith(".d.ts"));
  const sourceFileSet = new Set(sourceFiles);
  const roots = [
    resolve(projectRoot, "index.ts"),
    ...sourceFiles.filter((fileName) => fileName.startsWith(resolve(sourceRoot, "app"))),
  ];
  const visited = new Set<string>();
  const queue = [...roots];

  while (queue.length > 0) {
    const fileName = queue.shift();
    if (!fileName || visited.has(fileName)) continue;

    visited.add(fileName);
    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    for (const specifier of getModuleSpecifiers(sourceFile)) {
      const resolvedModule = ts.resolveModuleName(
        specifier,
        fileName,
        compilerOptions,
        ts.sys,
      ).resolvedModule;
      if (!resolvedModule) continue;

      const dependency = resolve(resolvedModule.resolvedFileName);
      if (sourceFileSet.has(dependency) && !visited.has(dependency)) queue.push(dependency);
    }
  }

  return sourceFiles
    .filter((fileName) => !visited.has(fileName))
    .map((fileName) => relative(projectRoot, fileName).replaceAll("\\", "/"))
    .sort();
};

describe("Expo route source reachability", () => {
  it("has no unreachable runtime TypeScript source", () => {
    expect(findUnreachableSourceFiles()).toEqual([]);
  });
});
