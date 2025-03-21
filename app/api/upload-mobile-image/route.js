import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `image-${Date.now()}${path.extname(file.name) || '.jpg'}`;
    const filePath = path.join(process.cwd(), 'public/temp-images', fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/temp-images/${fileName}`;
    console.log("✅ Image saved:", imageUrl);

    return NextResponse.json({ imageUrl }, { status: 200 });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
