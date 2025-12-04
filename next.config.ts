import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@anthropic-ai/sdk',
    'openai',
    'composio-core',
    '@mediapipe/face_mesh',
    '@mediapipe/camera_utils',
    'three',
  ],
};

export default nextConfig;
