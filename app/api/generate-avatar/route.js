import { NextResponse } from 'next/server';

const API_URL = "https://model-4w5z7opw.api.baseten.co/development/predict";
const API_KEY = process.env.BASETEN_API_KEY;
const NGROK_URL = process.env.NGROK_URL;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const relativeUrl = formData.get('image');
    const stylePrompt = formData.get('style');

    if (!relativeUrl || typeof relativeUrl !== 'string') {
      return NextResponse.json({ error: "No image URL provided." }, { status: 400 });
    }

    if (!stylePrompt || typeof stylePrompt !== 'string') {
      return NextResponse.json({ error: "No style prompt provided." }, { status: 400 });
    }

    const fullUrl = `${NGROK_URL}${relativeUrl}`;
    const seed = Math.floor(Math.random() * 1000000000);

    const payload = {
      positive_prompt: stylePrompt,
      negative_prompt: "face obscured, blurry face, extra limbs, unnatural lighting.",
      input_image: fullUrl,
      seed,
    };

    console.log("📤 Sending to Baseten:");
    console.log("🔗 Image URL:", fullUrl);
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
      if (item.node_id === '243') { // Changed to string '243' to match the response
        avatarBase64 = item.data;
        break; // Exit loop once found
      }
    }

    if (!avatarBase64) {
      console.error("❌ Baseten Error: Node 243 data not found in response:", data);
      return NextResponse.json({ error: "Failed to generate avatar (Node 243 data missing)." }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl: `data:image/png;base64,${avatarBase64}` });
  } catch (err) {
    console.error("🚨 Server Error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}