// app/api/check-new-image/route.js
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const tempImagesDir = path.join(process.cwd(), 'public/temp-images');

  try {
    const files = await fs.readdir(tempImagesDir);
    if (files.length > 0) {
      // Assuming the latest file is the newly uploaded image (simplistic approach for now)
      const latestImageFile = files[files.length - 1]; // Get the last file in directory listing
      const latestImageUrl = `/temp-images/${latestImageFile}`;

      // For simplicity, let's clear the directory after sending the URL (for testing - remove or refine in production)
      // await Promise.all(files.map(file => fs.unlink(path.join(tempImagesDir, file))));

      return NextResponse.json({ latestImageUrl }, { status: 200 });
    } else {
      return NextResponse.json({}, { status: 200 }); // No new image
    }
  } catch (error) {
    console.error("Error checking for new image:", error);
    return NextResponse.json({ error: 'Failed to check for new image' }, { status: 500 });
  }
}