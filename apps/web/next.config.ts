import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Pins the workspace root to this monorepo so Turbopack doesn't pick up
    // an unrelated lockfile elsewhere on the machine (stray-lockfile warning).
    root: path.join(__dirname, '..', '..'),
  },
};

export default nextConfig;
