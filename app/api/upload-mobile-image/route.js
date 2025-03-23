import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dirPath = path.join(process.cwd(), 'public/temp-images');
    if (!fs.existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true }); // 💡 create directory if not exists
    }

    const fileName = `image-${Date.now()}${path.extname(file.name) || '.jpg'}`;
    const filePath = path.join(dirPath, fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/temp-images/${fileName}`;
    console.log("✅ Image saved:", imageUrl);

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
