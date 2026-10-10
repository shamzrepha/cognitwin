import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemInstruction, userId, userRole, currentTokensUsed, tokenQuota } = await req.json();

    // The Gemini API key is strictly maintained on the server side (environment variable)
    // The platform owner (Shamz) pays the bill.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Platform AI Engine is initializing. Please configure GEMINI_API_KEY in your Vercel Project Environment Variables.' },
        { status: 503 }
      );
    }

    // Server-side Token & Billing Guardrails:
    // Teachers: 200,000 tokens limit
    // Students/Individuals: 50,000 tokens limit
    // Admin: unlimited
    const isOwner = userRole === 'admin' || userId === 'admin_shamz';
    const limit = tokenQuota || (userRole === 'teacher' ? 200000 : 50000);
    const used = currentTokensUsed || 0;

    if (!isOwner && used >= limit) {
      return NextResponse.json(
        {
          error: `AI Monthly Token Quota Reached (${used.toLocaleString()} / ${limit.toLocaleString()} tokens). To protect system resources from excessive billing, please contact Platform Super Admin Shamz for a quota increase.`,
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    // Approximate token count based on input + output length (~4 chars per token)
    const promptChars = (typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length);
    const responseChars = response.text?.length || 0;
    const estimatedTokens = Math.max(1, Math.ceil((promptChars + responseChars) / 4));

    return NextResponse.json({
      text: response.text,
      tokensUsed: estimatedTokens,
      newTotalTokens: used + estimatedTokens,
      quotaRemaining: Math.max(0, limit - (used + estimatedTokens)),
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
