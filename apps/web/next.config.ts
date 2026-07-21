import path from 'path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo root (two levels up: apps/web -> apps -> repo root), so
    // Turbopack doesn't get confused by the workspace-hoisted node_modules.
    root: path.resolve(__dirname, '..', '..'),
  },
};

export default nextConfig;
