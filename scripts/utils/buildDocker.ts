import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { webBuildCommand } from '../commands/webBuild.js';
import { createTempDir } from './createTempDir.js';
import { resolveRoot } from './paths.js';

interface BuildDockerOptions {
  tag: string;
  platform: string;
  release?: boolean;
}

export async function buildDocker(options: BuildDockerOptions): Promise<void> {
  const { tag, platform, release = false } = options;

  // Step 1: Create temp directory
  const tempDir = createTempDir();
  console.log(`[docker] Created temp directory: ${tempDir}`);

  try {
    // Step 2: Build frontend with webBuildCommand
    console.log('[docker] Building frontend...');
    await webBuildCommand({ useRelativeBase: true, release });

    // Step 3: Build server with rollup
    console.log('[docker] Building server with rollup...');
    await buildServer(tempDir);

    // Step 4: Copy frontend static files
    console.log('[docker] Copying frontend static files...');
    const staticDir = path.join(tempDir, 'static');
    await fs.mkdir(staticDir, { recursive: true });
    await copyDirectory(resolveRoot('dist'), staticDir);

    // Step 5: Create package.json
    console.log('[docker] Creating package.json...');
    await createPackageJson(tempDir, tag);

    // Step 6: Create data directory
    const dataDir = path.join(tempDir, 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Step 7: Create Dockerfile
    console.log('[docker] Creating Dockerfile...');
    await createDockerfile(tempDir);

    // Step 8: Build Docker image
    console.log('[docker] Building Docker image...');
    execSync(`docker build --platform=${platform} -t ${tag} .`, {
      cwd: tempDir,
      stdio: 'inherit',
    });

    console.log(`[docker] Successfully built Docker image: ${tag}`);
  } finally {
    // Clean up temp directory
    console.log('[docker] Cleaning up temp directory...');
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function buildServer(tempDir: string): Promise<void> {
  const inputOptions: RollupOptions = {
    input: resolveRoot('src/server/main.ts'),
    external: [
      'express',
      'path',
      'url',
      'fs',
      'fs/promises',
      'crypto',
      'os',
      'http',
      'https',
      'stream',
      'util',
      'buffer',
      'events',
      'querystring',
      'child_process',
      'zlib',
      'net',
      'tls',
      'dns',
    ],
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: resolveRoot('src') },
          { find: 'vscf', replacement: resolveRoot('src/packages/vscf') },
          { find: 'vs', replacement: resolveRoot('src/packages/vscf/internal') },
        ],
      }),
      resolve({
        preferBuiltins: true,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      }),
      json(),
      esbuild({
        target: 'es2022',
        sourceMap: false,
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        loaders: {
          '.ts': 'ts',
          '.tsx': 'tsx',
          '.js': 'js',
          '.jsx': 'jsx',
        },
      }),
    ],
  };

  const outputOptions: OutputOptions = {
    file: path.join(tempDir, 'server.js'),
    format: 'cjs',
    interop: 'auto',
    sourcemap: false,
  };

  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  await bundle.close();
}

async function copyDirectory(source: string, destination: string): Promise<void> {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDirectory(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

async function createPackageJson(tempDir: string, tag: string): Promise<void> {
  const packageJson = {
    name: 'tasks-server',
    version: tag,
    private: true,
    type: 'commonjs',
    main: 'server.js',
    dependencies: {
      express: '^4.18.2',
    },
  };

  await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}

async function createDockerfile(tempDir: string): Promise<void> {
  const dockerfile = `FROM node:24-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy server and static files
COPY server.js ./
COPY static ./static

# Create data directory
RUN mkdir -p /app/data

# Expose port (assuming server runs on port 3000)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV STATIC_DIR=/app/static

# Start the server
CMD ["node", "server.js"]
`;

  await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfile);
}
