// app/api/users/upload-profile/route.ts
import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { pool } from '@/lib/db';

// Configure Cloudinary directly in this file to avoid import issues
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    console.log('📤 Profile upload request received');
    
    // Check environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Missing Cloudinary environment variables');
      return new Response(
        JSON.stringify({ error: 'Cloudinary configuration missing' }),
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('profilePicture') as File;
    const userId = formData.get('userId') as string;

    console.log('📁 Form data:', { fileName: file?.name, userId });

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'File and userId are required' }),
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('📤 Uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'consol/profile-pictures',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result?.secure_url);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    console.log('💾 Updating database...');

    // Update user in database with new profile picture URL
    const dbResult = await pool.query(
      'UPDATE users SET profile_picture_url = $1 WHERE id = $2 RETURNING *',
      [(uploadResult as any).secure_url, userId]
    );

    if (dbResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    console.log('✅ Profile picture uploaded successfully');

    return new Response(
      JSON.stringify({
        message: 'Profile picture uploaded successfully',
        user: dbResult.rows[0],
        imageUrl: (uploadResult as any).secure_url
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload profile picture',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}