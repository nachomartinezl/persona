import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const tempImagesDir = path.join(process.cwd(), 'public/temp-images');

  try {
    const files = await fs.readdir(tempImagesDir);
    if (files.length > 0) {
      const latestImageFile = files[files.length - 1];
      const latestImagePath = path.join(tempImagesDir, latestImageFile);
      const latestImageUrl = `/temp-images/${latestImageFile}`;

      // Optionally delete the image after sending the response
      setTimeout(async () => {
        try {
          await fs.unlink(latestImagePath);
          console.log(`🧹 Deleted file after read: ${latestImagePath}`);
        } catch (err) {
          console.warn('⚠️ Failed to delete image:', err);
        }
      }, 1000); // Delay just in case fetch still reading

      return NextResponse.json({ latestImageUrl }, { status: 200 });
    } else {
      return NextResponse.json({ latestImageUrl: null }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking for new image:", error);
    return NextResponse.json({ error: 'Failed to check for new image' }, { status: 500 });
  }
}
