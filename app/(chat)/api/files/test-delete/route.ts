import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

// Initialize the S3 client with Cloudflare R2 credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }

  try {
    // Try to delete the object
    console.log(`Test endpoint: Attempting to delete key "${key}" from bucket "${process.env.CLOUDFLARE_R2_BUCKET_NAME}"`);
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    
    return NextResponse.json({
      success: true,
      message: `Test endpoint: Successfully deleted object with key "${key}"`,
    });
  } catch (error) {
    console.error('Test endpoint: R2 delete error:', error);
    return NextResponse.json({ 
      error: 'Deletion failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

// List objects in the bucket
export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    });

    const listResult = await s3Client.send(listCommand);
    
    return NextResponse.json({
      success: true,
      files: listResult.Contents?.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      })) || [],
    });
  } catch (error) {
    console.error('Test endpoint: R2 list error:', error);
    return NextResponse.json({ 
      error: 'List operation failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 