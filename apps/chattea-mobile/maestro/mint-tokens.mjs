import { Buffer } from "node:buffer";
import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const beDir =
  process.env.CHATTEA_BE_DIR ?? "/Volumes/Untitled/Documents/Github/chattea-workspace/chattea-be";
const envFile = process.env.CHATTEA_ENV_FILE ?? join(here, "..", ".env");

const env = Object.fromEntries(
  readFileSync(join(beDir, ".env"), "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
);

const sign = (payload, secret) => {
  const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const data = `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}`;
  return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
};

const userId = process.env.E2E_USER_ID ?? "aead3a4c-0c95-4f53-a281-656317140385";
const deviceId = "e2e-maestro";
const now = Math.floor(Date.now() / 1000);
const claims = { iss: "chattea-api", aud: "chattea-mobile", iat: now };

const accessToken = sign(
  { userId, tokenType: "access", ...claims, exp: now + 86400 * 30 },
  env.JWT_ACCESS_TOKEN_SECRET,
);
const refreshToken = sign(
  { userId, deviceId, tokenType: "refresh", ...claims, exp: now + 86400 * 30 },
  env.JWT_REFRESH_TOKEN_SECRET,
);

const lines = readFileSync(envFile, "utf8")
  .split("\n")
  .filter((line) => !/^EXPO_PUBLIC_DEV_(SESSION|REFRESH)_TOKEN=/.test(line));
lines.push(`EXPO_PUBLIC_DEV_SESSION_TOKEN=${accessToken}`);
lines.push(`EXPO_PUBLIC_DEV_REFRESH_TOKEN=${refreshToken}`);
writeFileSync(envFile, `${lines.join("\n").replace(/\n+$/, "\n")}`);

const refreshTokenHash = execFileSync(
  "node",
  ["-e", `process.stdout.write(require("bcrypt").hashSync(process.argv[1], 10))`, refreshToken],
  { cwd: beDir, encoding: "utf8" },
);
execFileSync(
  "psql",
  [
    "-h",
    process.env.PGHOST ?? "127.0.0.1",
    "-p",
    process.env.PGPORT ?? "5432",
    "-U",
    process.env.PGUSER ?? "chattea",
    "-d",
    process.env.PGDATABASE ?? "chattea",
    "-c",
    `INSERT INTO "refreshToken" (id, "userId", "deviceId", "refreshToken", "refreshTokenExp", "createdAt", "updatedAt")
     VALUES ('${randomUUID()}', '${userId}', '${deviceId}', '${refreshTokenHash}', to_timestamp(${now + 86400 * 30}), now(), now())
     ON CONFLICT ("userId", "deviceId") DO UPDATE SET "refreshToken" = EXCLUDED."refreshToken", "refreshTokenExp" = EXCLUDED."refreshTokenExp", "updatedAt" = now();`,
  ],
  {
    env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "chattea-dev" },
    stdio: ["ignore", "pipe", "inherit"],
  },
);
console.log(`wrote dev tokens to ${envFile} for user ${userId}`);
