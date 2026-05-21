import { NextResponse } from 'next/server';

interface ConversationTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_INSTRUCTION = `তুমি বাংলাদেশের একটি প্রিমিয়াম ই-কমার্স শপের বন্ধুত্বপূর্ণ AI চ্যাটবট সহকারী।
তোমার নাম "শপ অ্যাসিস্ট্যান্ট"।

আমাদের স্টোরের পণ্যসমূহ:
1. Sleek Smartwatch X-100 – $120 – Electronics – স্টকে আছে
2. Wireless Noise-Cancelling Headphones – $199.99 – Electronics – স্টকে আছে
3. Mechanical Gaming Keyboard – $75 – Electronics – স্টকে আছে
4. Minimalist Leather Backpack – $85 – Fashion – স্টকে আছে
5. Designer Sunglasses – $150 – Fashion – স্টক শেষ
6. Ergonomic Office Chair – $320 – Furniture – স্টকে আছে
7. Minimalist Table Lamp – $45 – Furniture – স্টকে আছে
8. Premium Ceramic Coffee Mug – $18.50 – Kitchen – স্টকে আছে

নিয়মাবলি:
- সবসময় স্বাভাবিক, উষ্ণ বাংলায় কথা বলো (২-৩ বাক্য)।
- ব্যবহারকারী যদি সালাম বা হ্যালো দেয়, উষ্ণভাবে সাড়া দাও।
- কেউ "কী করো", "কী হয়", "কেমন আছ" এসব জিজ্ঞেস করলে হাসিখুশিভাবে উত্তর দাও।
- ব্যবহারকারী Banglish (ইংরেজি হরফে বাংলা) লিখলেও বুঝে উত্তর দাও।
- স্টোরে নেই এমন পণ্য চাইলে সবচেয়ে কাছের বিকল্প সাজেস্ট করো।
- ডেলিভারি: ঢাকায় ২৪-৪৮ ঘণ্টা, বাইরে ৩-৫ কার্যদিবস।
- পেমেন্ট: বিকাশ, রকেট, ক্যাশ অন ডেলিভারি, কার্ড।
- রিটার্ন: ৭ দিনের মধ্যে।
- কখনো রোবোটিক ভাষায় কথা বলবে না।`;

const GEMINI_MODELS = [
  'gemini-2.5-flash',      // ✅ confirmed working
  'gemini-flash-latest',   // ✅ confirmed working (alias)
  'gemini-2.0-flash',      // fallback
  'gemini-2.0-flash-lite', // fallback
];

async function callGemini(
  apiKey: string,
  history: ConversationTurn[],
  userMessage: string,
  productContext: string
): Promise<string | null> {
  const userText = productContext
    ? `${userMessage}\n\n[পণ্য তথ্য: ${productContext}]`
    : userMessage;

  const contents: ConversationTurn[] = [
    ...history,
    { role: 'user', parts: [{ text: userText }] },
  ];

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents,
            generationConfig: { maxOutputTokens: 300, temperature: 0.85 },
          }),
        }
      );

      const data = await res.json();

      if (res.status === 429 || data?.error?.code === 429) {
        console.warn(`[Gemini/${model}] Quota exceeded, trying next...`);
        continue;
      }
      if (!res.ok) {
        console.error(`[Gemini/${model}] HTTP ${res.status}:`, data?.error?.message);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        console.log(`[Gemini/${model}] ✓ Success`);
        return text;
      }
    } catch (err) {
      console.error(`[Gemini/${model}] Network error:`, err);
    }
  }
  return null; // all models failed
}

export async function POST(request: Request) {
  let body: { message?: string; productContext?: string; history?: ConversationTurn[] } = {};

  try {
    body = await request.json();
    const message = (body.message || '').trim();
    const productContext = body.productContext || '';
    const history: ConversationTurn[] = body.history || [];

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && !apiKey.includes('YOUR_GEMINI_API_KEY') && apiKey.trim() !== '';

    if (hasValidKey) {
      const geminiReply = await callGemini(apiKey!, history, message, productContext);
      if (geminiReply) {
        return NextResponse.json({ response: geminiReply });
      }
    }

    // Smart fallback (when Gemini quota exceeded or no key)
    return NextResponse.json({ response: getSmartFallback(message, productContext) });

  } catch (error) {
    console.error('Chat route error:', error);
    return NextResponse.json({
      response: getSmartFallback(body?.message || '', body?.productContext || ''),
    });
  }
}

// ── Smart fallback: handles Banglish, conversational, product queries ────────
function getSmartFallback(message: string, productContext?: string): string {
  const q = (message || '').toLowerCase().trim();

  // ── Product context: product found in DB ──────────────────────────────────
  if (productContext?.includes('In Stock')) {
    return 'দারুণ! পণ্যটি এখন স্টকে আছে 🎉 আপনার কি কোনো প্রশ্ন আছে?';
  }
  if (productContext?.includes('Out of Stock')) {
    return 'দুঃখিত ভাই, পণ্যটি এই মুহূর্তে আমাদের স্টকে নেই। নিচে আমাদের অন্য পণ্যগুলো দেখতে পারেন!';
  }

  // ── Frustrated / rude messages ─────────────────────────────────────────────
  if (/bat khai|বাত খাই|pagol|পাগল|bakwas|বাজে|nonsense|tumi ki|তুমি কি/.test(q)) {
    return 'হাহা, মাফ করবেন! 😅 আমি কখনো বাত খাই না — শুধু আপনার কেনাকাটায় সাহায্য করি। কী লাগবে বলুন!';
  }

  // ── "Ki ache / kide che / what do you have" ──────────────────────────────
  if (/ki ache|kide che|ki pabo|ki pai|কি আছে|কী আছে|কি পাব|কী পাব|what.*have|what.*sell/.test(q)) {
    return 'আমাদের কাছে আছে:\n🎧 ইলেকট্রনিক্স — Smartwatch, Headphones, Keyboard\n👜 ফ্যাশন — Backpack, Sunglasses\n🪑 ফার্নিচার — Ergonomic Chair, Table Lamp\n☕ কিচেন — Ceramic Coffee Mug\n\nকোনটা দেখতে চান?';
  }

  // ── Availability: "X ache?" patterns (Banglish + Bengali) ─────────────────
  if (/(keyboard|keyboord|ki.?board|কীবোর্ড).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(keyboard|keyboord|ki.?board|কীবোর্ড)/.test(q)) {
    return 'হ্যাঁ! আমাদের Mechanical Gaming Keyboard আছে — মাত্র $75। "keyboard" লিখে সার্চ করুন! ⌨️';
  }
  if (/(gori|ghori|ghari|watch|ঘড়ি|smartwatch).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(gori|ghori|ghari|watch|ঘড়ি)/.test(q)) {
    return 'হ্যাঁ! আমাদের Sleek Smartwatch X-100 আছে — মাত্র $120। "watch" লিখে সার্চ করুন! ⌚';
  }
  if (/(mug|মগ|cup|কাপ).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(mug|মগ|cup|কাপ)/.test(q)) {
    return 'হ্যাঁ! আমাদের Premium Ceramic Coffee Mug আছে — মাত্র $18.50। "mug" লিখে সার্চ করুন! ☕';
  }
  if (/(headphone|হেডফোন|earphone|ইয়ারফোন).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(headphone|হেডফোন)/.test(q)) {
    return 'হ্যাঁ! আমাদের Wireless Noise-Cancelling Headphones আছে — $199.99। "headphone" লিখে সার্চ করুন! 🎧';
  }
  if (/(bag|backpack|ব্যাগ).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(bag|backpack|ব্যাগ)/.test(q)) {
    return 'হ্যাঁ! আমাদের Minimalist Leather Backpack আছে — $85। "backpack" লিখে সার্চ করুন! 🎒';
  }
  if (/(chair|চেয়ার|sofa|সোফা).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(chair|চেয়ার)/.test(q)) {
    return 'হ্যাঁ! আমাদের Ergonomic Office Chair আছে — $320। "chair" লিখে সার্চ করুন! 🪑';
  }
  if (/(lamp|light|বাতি|ল্যাম্প).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(lamp|light|বাতি|ল্যাম্প)/.test(q)) {
    return 'হ্যাঁ! আমাদের Minimalist Table Lamp আছে — $45। "lamp" লিখে সার্চ করুন! 💡';
  }
  if (/(sunglass|চশমা|glass|chasma).*(ache|আছে|pawa|pai)/.test(q)
    || /(ache|আছে).*(sunglass|চশমা|chasma)/.test(q)) {
    return 'আমাদের Designer Sunglasses আছে কিন্তু এই মুহূর্তে স্টক আউট 😔 অন্য পণ্যগুলো দেখতে চান?';
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (/hello|hi\b|hey|আস|হ্যালো|হাই|সালাম|assalamu/.test(q)) {
    return 'ওয়ালাইকুম আসসালাম! 😊 আমাদের শপে আপনাকে স্বাগতম। আজকে কী কিনবেন?';
  }

  // ── Casual chat ──────────────────────────────────────────────────────────
  if (/কেমন আছ|how are you|কী কর|ki kor|কি হচ্ছ|কী হচ্ছ|what.*do/.test(q)) {
    return 'আলহামদুলিল্লাহ, বেশ ভালো! 😄 আমি আপনার শপিং সহকারী — পণ্য খুঁজতে বা কিনতে সাহায্য করি। কী লাগবে?';
  }

  // ── Product count ─────────────────────────────────────────────────────────
  if (/কয়টা|কতটা|কত.*পণ্য|কয়.*প্রোডাক্ট|how many/.test(q)) {
    return 'আমাদের স্টোরে এখন ৮টি প্রিমিয়াম পণ্য আছে — ইলেকট্রনিক্স, ফ্যাশন, ফার্নিচার ও কিচেন ক্যাটাগরিতে! কোনটা দেখবেন?';
  }

  // ── Unavailable products ──────────────────────────────────────────────────
  if (/\bmobile\b|মোবাইল|\bphone\b|ফোন|smartphone/.test(q)) {
    return 'দুঃখিত, মোবাইল এখন আমাদের স্টকে নেই। তবে আমাদের Sleek Smartwatch X-100 ($120) দেখতে পারেন — দারুণ একটি গ্যাজেট! 😊';
  }
  if (/\btv\b|টিভি|television/.test(q)) {
    return 'টিভি এই মুহূর্তে আমাদের স্টকে নেই। তবে Wireless Noise-Cancelling Headphones ($199.99) দিয়ে বাড়িতেই সিনেমার অনুভূতি পাবেন!';
  }
  if (/laptop|ল্যাপটপ|computer|কম্পিউটার/.test(q)) {
    return 'দুঃখিত, ল্যাপটপ এখন আমাদের স্টকে নেই। তবে আমাদের Mechanical Gaming Keyboard ($75) দিয়ে গেমিং সেটআপ নিন! 🎮';
  }

  // ── Gift / occasion ───────────────────────────────────────────────────────
  if (/বিয|wedding|gift|উপহার/.test(q)) {
    return 'গিফটের জন্য আমাদের Sleek Smartwatch X-100 বা Minimalist Leather Backpack দারুণ অপশন! বাজেট কত রাখতে চান?';
  }

  // ── Delivery ──────────────────────────────────────────────────────────────
  if (/delivery|ডেলিভারি|কত দিন|কত সময়|deliver/.test(q)) {
    return 'ঢাকায় ২৪-৪৮ ঘণ্টায়, ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয় 🚚';
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  if (/payment|পেমেন্ট|বিকাশ|রকেট|ক্যাশ|টাকা|pay/.test(q)) {
    return 'বিকাশ, রকেট, ক্যাশ অন ডেলিভারি এবং ক্রেডিট/ডেবিট কার্ড — সব পদ্ধতিতে পেমেন্ট করা যায়! 💳';
  }

  // ── Return / warranty ─────────────────────────────────────────────────────
  if (/return|ফেরত|ওয়ারেন্টি|warranty/.test(q)) {
    return 'পণ্য পেয়ে সন্তুষ্ট না হলে ৭ দিনের মধ্যে ফেরত দিতে পারবেন। আমরা পূর্ণ রিফান্ড নিশ্চিত করি ✅';
  }

  // ── Price / discount ──────────────────────────────────────────────────────
  if (/দাম|price|কত|cost|discount|ছাড়/.test(q)) {
    return 'আমাদের পণ্যের দাম $18.50 থেকে শুরু হয়ে $320 পর্যন্ত। কোন পণ্যটির দাম জানতে চান?';
  }

  // ── Default: helpful nudge ────────────────────────────────────────────────
  return 'বুঝতে পারিনি, একটু পরিষ্কার করে বলুন 😊 পণ্য খুঁজতে "watch", "keyboard", "mug", "headphone", "bag", "chair" লিখুন!';
}
