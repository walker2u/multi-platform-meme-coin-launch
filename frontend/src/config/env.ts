export const env = {
  reownProjectId:
    process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'demo_reown_project_id_123456789',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY || 'test_api_key_multiplatform_launch',
  defaultChain: process.env.NEXT_PUBLIC_DEFAULT_CHAIN || 'base',
};
