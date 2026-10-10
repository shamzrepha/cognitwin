import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      action,
      systemInstruction,
      userId,
      userRole,
      currentTokensUsed,
      tokenQuota,
      className,
      subject,
      topic,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured in environment variables. Please add GEMINI_API_KEY in Vercel project settings.' },
        { status: 503 }
      );
    }

    // Token limit protection:
    // Teachers: 200,000 tokens
    // Students/Individuals: 50,000 tokens
    // Admin: unlimited
    const isOwner = userRole === 'admin' || userId === 'admin_shamz';
    const limit = tokenQuota || (userRole === 'teacher' ? 200000 : 50000);
    const used = currentTokensUsed || 0;

    if (!isOwner && used >= limit) {
      return NextResponse.json(
        {
          error: `AI Monthly Token Quota Reached (${used.toLocaleString()} / ${limit.toLocaleString()} tokens). Please contact Platform Super Admin Shamz for a quota increase.`,
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // ACTION 1: Generate AI Syllabus
    if (action === 'generate_syllabus') {
      const syllabusPrompt = `You are a curriculum architect and pedagogical cognitive scientist for an engineering & sciences LMS called CogniTwin.
Generate a structured 4-topic syllabus for the following class:
- Class Name: ${className || 'Advanced Engineering'}
- Subject: ${subject || 'Physical Science'}
- Unit/Topic: ${topic || 'Core Principles'}

Return ONLY a valid JSON array of 4 Knowledge Component objects with NO markdown formatting, NO backticks.
Each object must have the exact structure:
[
  {
    "id": "kc-unique-id",
    "code": "CODE-101",
    "title": "Topic Title",
    "description": "Clear 1-2 sentence concept explanation.",
    "unit": "Unit 1: Foundational Principles",
    "difficulty": "beginner",
    "prerequisites": [],
    "bktParams": { "pL0": 0.25, "pT": 0.18, "pG": 0.2, "pS": 0.1 },
    "simulation": {
      "id": "sim-unique-id",
      "title": "Digital Twin Lab Title",
      "description": "What the student wires or simulates in the digital twin lab.",
      "type": "electronics",
      "targetObjective": "Specific objective to accomplish in the simulation",
      "xpReward": 150
    }
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: syllabusPrompt,
      });

      let rawText = response.text || '';
      // Strip any markdown code fences if Gemini added them
      rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      let topics = [];
      try {
        topics = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini syllabus JSON:', parseErr, rawText);
        // Fallback to structured default topics if JSON parse fails
        topics = [
          {
            id: `kc-${Date.now()}-1`,
            code: `${(subject || 'ENG').substring(0, 4).toUpperCase()}-101`,
            title: `Foundations of ${topic || className}`,
            description: `Core theoretical principles and governing formulas for ${className}.`,
            unit: 'Unit 1: Fundamentals',
            difficulty: 'beginner',
            prerequisites: [],
            bktParams: { pL0: 0.3, pT: 0.2, pG: 0.2, pS: 0.1 },
            simulation: {
              id: `sim-${Date.now()}-1`,
              title: `${topic || className} Circuit Baseline`,
              description: 'Wire the initial circuit loop and measure steady-state parameters.',
              type: 'electronics',
              targetObjective: 'Establish baseline electrical and physical equilibrium',
              xpReward: 150,
            },
          },
          {
            id: `kc-${Date.now()}-2`,
            code: `${(subject || 'ENG').substring(0, 4).toUpperCase()}-102`,
            title: `${topic || className} Dynamic Analysis`,
            description: `Modeling non-linear behavior, voltage regulation, and signal response.`,
            unit: 'Unit 2: Dynamic System Response',
            difficulty: 'intermediate',
            prerequisites: [],
            bktParams: { pL0: 0.2, pT: 0.15, pG: 0.18, pS: 0.12 },
            simulation: {
              id: `sim-${Date.now()}-2`,
              title: `${topic || className} Optimization Lab`,
              description: 'Adjust load resistance and verify Ohm\'s Law compliance.',
              type: 'electronics',
              targetObjective: 'Tune circuit to within 5% of target efficiency threshold',
              xpReward: 200,
            },
          },
        ];
      }

      const promptChars = syllabusPrompt.length;
      const responseChars = rawText.length;
      const estimatedTokens = Math.max(1, Math.ceil((promptChars + responseChars) / 4));

      return NextResponse.json({
        topics,
        tokensUsed: estimatedTokens,
        newTotalTokens: used + estimatedTokens,
      });
    }

    // ACTION 2: General Generation (Prompt, Chat, NotebookLM Audio Overview)
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

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
