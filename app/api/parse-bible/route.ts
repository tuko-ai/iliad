import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a character bible parser for a cinematic AI filmmaking pipeline. Extract character data from the provided document and return ONLY a JSON object with these exact keys:
- subjectDescription: physical appearance, age, features, body type, hair, face, distinctive traits — combine all physical description into one rich paragraph
- wardrobe: clothing, costume, outfit, accessories, style of dress
- mood: emotional tone, personality, psychological traits, behavioral characteristics
- setting: primary environment, location, world, time period where this character exists
- visualStyle: one of exactly ["photorealistic","anime-painterly","cel-shaded-3d","stylized-3d"] — infer from context, default to "photorealistic"
- technicalStyle: one of exactly ["kodak-portra","anime","cel"] — infer from context, default to "kodak-portra"

Use empty string "" for any field not found in the document. Return ONLY valid JSON, no markdown, no other text.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { text?: string; pdfBase64?: string }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: any

    if (body.pdfBase64) {
      content = [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: body.pdfBase64 },
        },
        { type: 'text', text: 'Extract the character data from this document.' },
      ]
    } else {
      content = `Extract the character data from this document:\n\n${body.text}`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const parsed = JSON.parse(cleaned)

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Parse failed'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
