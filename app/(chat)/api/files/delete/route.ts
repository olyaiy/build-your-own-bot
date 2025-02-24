import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';

const DeleteRequestSchema = z.object({
  key: z.string().min(1, 'File key is required'),
});

// Initialize the S3 client with Cloudflare R2 credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('Delete API received request body:', body);
    
    const validatedData = DeleteRequestSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMessage = validatedData.error.errors
        .map((error) => error.message)
        .join(', ');
      
      console.log('Delete API validation error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { key } = validatedData.data;
    console.log('Delete API attempting to delete key:', key);

    try {
      // Delete the file from Cloudflare R2
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
      });

      console.log('Delete API executing delete command with bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
      await s3Client.send(deleteCommand);
      console.log('Delete API: Delete command executed successfully');

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      console.error('R2 delete error details:', error);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error details:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
} 