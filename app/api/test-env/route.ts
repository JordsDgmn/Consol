// app/api/test-env/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return new Response(
    JSON.stringify({
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) + '...',
    }),
    { status: 200 }
  );
}