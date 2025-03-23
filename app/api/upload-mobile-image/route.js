import fs from 'fs';
import { writeFile } from 'fs/promises';
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

    const fileName = `image-${Date.now()}${path.extname(file.name) || '.jpg'}`;
    const filePath = path.join('/tmp', fileName);

    // ✅ Save image in /tmp (runtime-safe on Vercel)
    await writeFile(filePath, buffer);

    // 🧠 Save metadata for polling from desktop
    const latestJsonPath = path.join('/tmp', 'latest.json');
    await writeFile(latestJsonPath, JSON.stringify({ imagePath: filePath }));

    console.log("✅ Image saved to:", filePath);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
