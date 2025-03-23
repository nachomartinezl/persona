import { NextResponse } from 'next/server';
import sharp from 'sharp';

const API_URL = process.env.BASETEN_API_URL;
const API_KEY = process.env.BASETEN_API_KEY;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    const stylePrompt = formData.get('style');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!stylePrompt || typeof stylePrompt !== 'string' || stylePrompt.trim() === '') {
      return NextResponse.json({ error: "No style prompt provided." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const resizedBuffer = await sharp(fileBuffer)
      .resize(896, 896, {
        fit: 'cover',
        position: 'center',
      })  
      .png()
      .toBuffer();

    const base64Image = resizedBuffer.toString('base64');
    const base64Payload = {
      type: "image",
      data: `data:image/png;base64,${base64Image}`,
    };

    const seed = Math.floor(Math.random() * 1e9);

    const payload = {
      positive_prompt: stylePrompt,
      negative_prompt: "face obscured, blurry face, extra limbs, unnatural lighting.",
      input_image: base64Payload,
      seed,
      steps: 18,
      cfg: 0.9,
      guidance: 50,
      width: 896,
      height: 896,
    };

    console.log("📤 Sending to Baseten:");
    console.log("🖌️ Prompt:", stylePrompt);
    console.log("🎲 Seed:", seed);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workflow_values: payload }),
    });

    const data = await res.json();

    if (!res.ok || !data.result || data.result.length < 1) {
      console.error("❌ Baseten Error Response:", data);
      return NextResponse.json({ error: "Failed to generate avatar." }, { status: 500 });
    }

    let avatarBase64 = null;
    for (const item of data.result) {
      if (item.node_id === 243 || item.node_id === "243") {
        avatarBase64 = item.data;
        break;
      }
    }

    if (!avatarBase64) {
      console.error("❌ Node 243 not found in response:", data);
      return NextResponse.json({ error: "Avatar image not found in output." }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl: `data:image/png;base64,${avatarBase64}` });
  } catch (err) {
    console.error("🚨 Server Error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
