import { auth } from '@clerk/nextjs/server';
import imagekit from '@/configs/imageKit';

/**
 * POST /api/upload
 * Upload a file to ImageKit
 */
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `/delivery-partners/${userId}`,
    });

    return Response.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { message: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}
