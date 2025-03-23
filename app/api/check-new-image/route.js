import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const latestJsonPath = path.join('/tmp', 'latest.json');

  try {
    const exists = await fs.stat(latestJsonPath).catch(() => null);
    if (!exists) {
      return NextResponse.json({ latestImageUrl: null }, { status: 200 });
    }

    const json = await fs.readFile(latestJsonPath, 'utf-8');
    const { imagePath } = JSON.parse(json);

    const imageExists = await fs.stat(imagePath).catch(() => null);
    if (!imageExists) {
      return NextResponse.json({ latestImageUrl: null }, { status: 200 });
    }

    const imageBuffer = await fs.readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mime = 'image/jpeg'; // or image/png if needed
    const base64Url = `data:${mime};base64,${base64}`;

    // ✅ Clean up after successful read
    await fs.unlink(imagePath).catch(() => {});
    await fs.unlink(latestJsonPath).catch(() => {});
    console.log(`✅ Temp image served and deleted: ${imagePath}`);

    return NextResponse.json({ latestImageUrl: base64Url }, { status: 200 });
  } catch (error) {
    console.error("❌ Error checking for new image:", error);
    return NextResponse.json({ error: 'Failed to check for new image' }, { status: 500 });
  }
}
