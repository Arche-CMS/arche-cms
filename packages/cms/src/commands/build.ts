/* eslint-disable no-console */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface BuildOptions {
  clean?: boolean;
  outDir?: string;
}

export function printBuildHelp(): void {
  console.log(`
Usage: cms build [options]

Build the CMS for production.

Options:
  --clean        Clean build artifacts before building
  --out-dir      Output directory for production bundle
  --help         Show this help
`);
  process.exit(0);
}

function generateDockerfile(outDir: string): void {
  const dockerfile = `FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 cms

COPY package.json ./
RUN corepack enable && yarn install --production --frozen-lockfile

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

USER cms

CMD ["node", "dist/index.js", "start"]
`;

  const dockerignore = `node_modules
.git
.gitignore
*.md
test/
tests/
coverage/
.env
.env.*
`;

  writeFileSync(join(outDir, "Dockerfile"), dockerfile);
  writeFileSync(join(outDir, ".dockerignore"), dockerignore);
}

function generatePackageJson(outDir: string): void {
  const pkg = {
    name: "altrugenix-cms-production",
    version: "0.0.1",
    private: true,
    type: "module",
    packageManager: "yarn@4.17.0",
    scripts: {
      start: "node dist/index.js start",
    },
    dependencies: {
      fastify: "^5.3.2",
      "@fastify/cors": "^11.0.1",
      "@fastify/rate-limit": "^10.2.2",
      "@fastify/static": "^8.1.1",
      "@fastify/swagger": "^9.4.2",
      "@fastify/swagger-ui": "^5.2.2",
      graphql: "^16.0.0",
      mercurius: "^16.9.0",
      "@libsql/client": "^0.17.4",
      "drizzle-orm": "^0.45.2",
      pg: "^8.22.0",
      zod: "^4.4.3",
    },
  };

  writeFileSync(join(outDir, "package.json"), JSON.stringify(pkg, null, 2));
}

const ADMIN_DIST = "apps/admin/dist";
const CMS_DIST = "packages/cms/dist";

export async function build(options: BuildOptions): Promise<void> {
  const log = (msg: string) => console.log(`[cms] ${msg}`);

  log("Building CMS for production...");

  if (options.clean) {
    log("Cleaning build artifacts...");
    execSync("yarn clean", { stdio: "inherit" });
  }

  // Build the admin panel UI (Vite SPA)
  log("Building admin panel...");
  try {
    execSync("yarn workspace @altrugenix/admin build", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });
    log("Admin panel built");
  } catch {
    log("Warning: admin panel build failed (admin-ui will not be available)");
  }

  // Build the TypeScript server code
  log("Building server code...");
  execSync("yarn workspace @altrugenix/cms build", { stdio: "inherit" });

  log("Build complete");
  log(`  Admin panel: ${ADMIN_DIST}/`);
  log(`  Server code: ${CMS_DIST}/`);

  if (!options.outDir) return;

  const outDir = resolve(options.outDir);
  log(`Assembling production bundle in ${outDir}...`);

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const adminOut = join(outDir, "admin");
  if (existsSync(ADMIN_DIST)) {
    if (!existsSync(adminOut)) mkdirSync(adminOut, { recursive: true });
    cpSync(ADMIN_DIST, adminOut, { recursive: true });
    log(`  Copied admin panel → admin/`);
  }

  if (existsSync(CMS_DIST)) {
    cpSync(CMS_DIST, join(outDir, "dist"), { recursive: true });
    log(`  Copied server code → dist/`);
  }

  generateDockerfile(outDir);
  generatePackageJson(outDir);
  log(`  Generated Dockerfile`);
  log(`  Generated package.json`);

  log(`Production bundle ready at ${outDir}`);
}
