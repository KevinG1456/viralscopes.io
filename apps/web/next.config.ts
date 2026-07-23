import path from 'path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Minimal production image for infra/docker/Dockerfile.web (Phase 2).
  output: 'standalone',
  turbopack: {
    // Monorepo root (two levels up: apps/web -> apps -> repo root), so
    // Turbopack doesn't get confused by the workspace-hoisted node_modules.
    root: path.resolve(__dirname, '..', '..'),
  },
};

export default nextConfig;
