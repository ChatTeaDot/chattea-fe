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
  it("exports a named arrow component as the default of every TSX module", () => {
    const violations: string[] = [];
    for (const fileName of ts.sys.readDirectory(sourceRoot, [".tsx"])) {
      const source = ts.createSourceFile(
        fileName,
        readFileSync(fileName, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      if (source.statements.every(ts.isExportDeclaration)) continue;
      const exported = source.statements.find(ts.isExportAssignment);
      const declarations = source.statements
        .filter(ts.isVariableStatement)
        .flatMap((statement) => [...statement.declarationList.declarations]);
      const component = declarations.find(
        (declaration) =>
          exported &&
          ts.isIdentifier(exported.expression) &&
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === exported.expression.text,
      );
      if (
        !component?.initializer ||
        !ts.isArrowFunction(component.initializer) ||
        !ts.isBlock(component.initializer.body)
      ) {
        violations.push(relative(sourceRoot, fileName));
      }
    }
    expect(violations).toEqual([]);
  });

  it("has no unreachable runtime TypeScript source", () => {
    expect(findUnreachableSourceFiles()).toEqual([]);
  });

  it("keeps route entry points, feature data access, and shared code within their boundaries", () => {
    const violations: string[] = [];
    const compilerOptions = getCompilerOptions();
    for (const fileName of ts.sys.readDirectory(sourceRoot, [".ts", ".tsx"])) {
      const file = relative(sourceRoot, fileName).replaceAll("\\", "/");
      const source = ts.createSourceFile(
        fileName,
        readFileSync(fileName, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      for (const specifier of getModuleSpecifiers(source)) {
        const dependency = ts.resolveModuleName(specifier, fileName, compilerOptions, ts.sys)
          .resolvedModule?.resolvedFileName;
        const target = dependency && relative(sourceRoot, dependency).replaceAll("\\", "/");
        const owner = file.match(/^features\/([^/]+)\//)?.[1];
        const targetFeature = target?.match(/^features\/([^/]+)\//)?.[1];
        if (targetFeature && owner === targetFeature && !specifier.startsWith(".")) {
          violations.push(`${file} uses an alias within its feature: ${specifier}`);
        }
        if (
          targetFeature &&
          owner !== targetFeature &&
          specifier !== `@/features/${targetFeature}`
        ) {
          violations.push(`${file} bypasses the feature entry point: ${specifier}`);
        }
        if (file.startsWith("shared/") && target?.match(/^(app|features|providers|screens)\//)) {
          violations.push(`${file} imports application code: ${target}`);
        }
        if (file.startsWith("features/") && target?.startsWith("screens/")) {
          violations.push(`${file} imports a screen: ${target}`);
        }
        if (
          file.startsWith("app/") &&
          target?.match(/^(features|screens)\//) &&
          target !== "screens/index.ts"
        ) {
          violations.push(`${file} bypasses a screen entry point: ${target}`);
        }
        if (
          (file.startsWith("features/") || file.startsWith("screens/")) &&
          specifier === "@apollo/client/react" &&
          !file.endsWith("/hooks.ts")
        ) {
          violations.push(`${file} owns data hooks outside hooks.ts`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
