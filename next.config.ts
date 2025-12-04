import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@anthropic-ai/sdk',
    'openai',
    'composio-core',
    '@mediapipe/face_mesh',
    '@mediapipe/camera_utils',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'hume',
  ],
  // Reduce server bundle size
  outputFileTracingExcludes: {
    '*': [
      'node_modules/three/**',
      'node_modules/@react-three/**',
      'node_modules/openai/**',
      'node_modules/composio-core/**',
    ],
  },
};

export default nextConfig;
