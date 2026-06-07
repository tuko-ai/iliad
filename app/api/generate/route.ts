import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { logGeneration } from '@/lib/logger'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
interface ImageRef { dataUrl: string; name: string }
type ContentBlock = Anthropic.ImageBlockParam | Anthropic.TextBlockParam

function parseImage(ref: ImageRef | null | undefined): { mediaType: ImageMediaType; data: string } | null {
  if (!ref?.dataUrl) return null
  const match = ref.dataUrl.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/)
  if (!match) return null
  return { mediaType: match[1] as ImageMediaType, data: match[2] }
}

function imageBlock(ref: ImageRef | null | undefined): Anthropic.ImageBlockParam | null {
  const parsed = parseImage(ref)
  if (!parsed) return null
  return { type: 'image', source: { type: 'base64', media_type: parsed.mediaType, data: parsed.data } }
}

function buildContent(module: string, body: Record<string, unknown>): ContentBlock[] {
  const blocks: ContentBlock[] = []

  const addImage = (ref: unknown, annotation: string) => {
    const block = imageBlock(ref as ImageRef | null)
    if (block) {
      blocks.push(block)
      blocks.push({ type: 'text', text: `[Image above: ${annotation}]` })
    }
  }

  switch (module) {
    case 'character-sheet':
      addImage(body.characterRef, 'character reference — analyze art style, color palette, distinctive features, silhouette, costume details')
      break
    case 'storyboard':
      addImage(body.characterRefA, 'CHARACTER A reference — analyze appearance, costume, silhouette, movement quality')
      addImage(body.characterRefB, 'CHARACTER B reference — analyze appearance, costume, silhouette, movement quality')
      addImage(body.environmentImageRef, 'ENVIRONMENT reference — analyze space, lighting, atmosphere, textures, scale')
      break
    case 'video':
      addImage(body.storyboardImageRef, 'STORYBOARD reference — analyze panel composition, shot types, progression, camera flow')
      addImage(body.characterImageRef, 'CHARACTER reference — analyze design, movement quality, visual presence')
      break
    case 'logo':
      addImage(body.logoImageRef, 'LOGO reference — analyze shape language, letterform style, line weights, colors, negative space, proportions')
      break
  }

  blocks.push({ type: 'text', text: buildUserMessage(body) })
  return blocks
}

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────

const OUTPUT_ONLY = 'Output ONLY the final prompt text. No preamble, no explanations, no markdown code blocks, no quotes around the output.'

const STORYBOARD_SYSTEM = `You are a professional cinematic storyboard prompt engineer using the Kōda storyboard system. Generate a complete, production-ready GPT Image 2 storyboard sheet prompt from the provided scene data. The user will paste this output directly into GPT Image 2 to generate the storyboard image.

${OUTPUT_ONLY}

━━━ KŌDA TEMPLATE STRUCTURE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output these sections in this exact order. Keep all section labels exactly as written.

Create a 16:9 image.

[PROJECT CARD]
Create a compact designed masthead, not a table.
TITLE: [largest expressive scene-inspired title]
META LINE: [mood] / [genre] / [energy]
PRIORITY: [main visual readability priority — what must be readable above all else]
MICRO BRIEF: [one compact sequence goal]

[CONTINUITY HEADER]
SEQUENCE ID: [production-safe id derived from title and scene]
REFERENCE PRIORITY: [identity reference controls face, body, wardrobe, proportions; this storyboard controls staging, motion, geography, continuity]

[SCENE PACKET]
PREMISE: [one sentence describing the core event]
LOCATION: [place, time, spatial layout, hazards, usable surfaces]
START -> END: [starting positions/state -> ending positions/tension]
ACTION CHAIN: [compact cause-effect movement logic — trigger + movement + reaction + visible result]
PROP / EFFECT STATE: [important objects, trails, damage, doors, lights, transformations]
MUST READ: [single most important visual idea the image must communicate]

[CHARACTER SANITIZATION]
C1: [visible anchors only: age range, silhouette, hair, clothing shape, key prop, posture/movement quality]
[C2: if second character provided — same format]
Remove contradictory traits, invisible psychology, excessive costume detail, and backstory that cannot appear in a panel.

[IDENTITY CONSISTENCY]
[Identity reference controls face/body/wardrobe/proportions if provided; keep character IDs, silhouette, wardrobe, key prop, and screen side consistent across all panels; do not redesign, age-shift, or merge characters]

[STORYBOARD PURITY]
Panel images are visual-only low-detail monochrome light-gray rough sketches. No text, arrows, labels, captions, subtitles, timing marks, diagrams, UI, ghost poses, duplicate bodies, or technical overlays inside panel image areas. Panel numbers, beat names, and lens tags go in the header strip OUTSIDE each panel image only.

[MASTER SHOT RULE]
[Include when scene has multiple characters, pursuit, combat, vehicles, doors, room transitions, or changing screen direction — Panel 01 or 02 shows full playable space: character positions, entrances/exits, main prop, foreground/midground/background, screen direction]

[EMOTIONAL ARC]
[Visible feeling progression expressed through posture, distance, eye-line, hand tension, blocking, pace, and framing — e.g. calm → alarm → decision → impact → unresolved dread]

[STYLE LOCKS]
STYLE LOCK: [visual medium + lighting behavior + palette/grade + texture/finish + shadow language + effect style + motion quality — complete and self-contained]
EFFECT LOCK: [effect thickness, glow strength, edge softness, saturation, behavior]
ENVIRONMENT LOCK: [environment rendering style — no realistic texture drift or flat cartoon drift unless requested]

[SPATIAL CONTINUITY LOCK — include ONLY when fixed set geometry, continuous shots, room returns, or fragile panel-to-panel layout matters; omit for simple boards]
[Name exact panels that share one layout. State camera axis: same axis / farther pullback / push-in / side track / hold. Lock visible anchors: main prop position, character screen side, doors, windows, furniture silhouettes, light direction, damage marks. State only allowed changes between locked panels: camera distance, pose, eye-line, object motion, light state.]

[DIRECTOR STRIP]
Bottom animatic track board aligned to panel columns. Seven tracks: BEAT LINE, CAMERA PATH, ACTION PATH, RHYTHM TRACK, ESCALATION MAP, STATE TRACK, STYLE TRACK. Use shot chips, thin lines, rhythm blocks, small intensity bars, one-to-three-word labels. No seconds or timestamps anywhere.

RHYTHM TRACK format per panel — STRICTLY: RHY P##: [tempo] / [block] / [beat-feel]
  tempo: hold | slow reveal | build | burst | impact | pause | recover | final hit
  block: short block | medium block | long block
  beat-feel: clean beat | match beat | smash beat | held beat | whip beat
  ✓ Good: RHY P03: burst / short block / smash beat
  ✗ Bad: fast / intense / scary / dramatic / high energy

ESCALATION MAP format per panel — STRICTLY: ESC P##: L# / [curve]
  L#: L1 calm | L2 tension | L3 rise | L4 surge | L5 peak
  curve: flat | rise | spike | drop | release | unresolved
  ✓ Good: ESC P03: L4 surge / spike
  ✗ Bad: 0.8 / more intense / high / dramatic

PANEL HEADERS: P01 / [lens] / [beat] → P02 / [lens] / [beat] → P03 / [lens] / [beat] → ...
CAMERA + LENS PLAN: P01 [camera+lens] → P02 [camera+lens] → ...
ACTION PATH: P01 [action verb phrase] → P02 [action verb phrase] → ...
RHYTHM TRACK: P01 [RHY P01: tempo / block / beat-feel] → P02 [RHY P02: ...] → ...
ESCALATION MAP: P01 [ESC P01: L# / curve] → P02 [ESC P02: L# / curve] → ...
STATE TRACK: P01 [continuity token] → P02 [continuity token] → ...
STYLE TRACK: P01 [style token] → P02 [style token] → ...

[SEQUENCE]
Grid: [panel count × layout — one sentence describing overall board structure]

━━━ CRITICAL RULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STORYBOARD PURITY — enforce strictly:
• Panel interiors contain ONLY the scene drawing: character poses, environment, props, effects, composition.
• NO text, arrows, captions, labels, speech bubbles, subtitles, timing marks, camera rigs, UI, ghost poses, duplicate bodies, colored fills, or technical overlays inside panel image areas.
• Panel headers (P##, lens tag, beat name) go OUTSIDE panels in the header strip — never inside the drawing.
• A panel must not show repeated copies of the same character to explain motion; one clear pose per character per panel.

DIRECTOR STRIP — non-negotiable formats:
• RHYTHM TRACK: Every entry MUST be RHY P##: [tempo] / [block] / [beat-feel]. No exceptions.
• ESCALATION MAP: Every entry MUST be ESC P##: L# / [curve]. No decimals, no vague phrases.
• No seconds, timestamps, or duration labels anywhere in the director strip.

[SEQUENCE] — strict content limit:
• Contains ONLY one Grid: line.
• No numbered panel descriptions under [SEQUENCE].
• No Panel:, Camera:, Action:, Emotion:, Continuity:, Rhythm track:, or Escalation map: lines under [SEQUENCE].
• All panel detail goes in [DIRECTOR STRIP] plan lines above.

CHARACTER RULES:
• Use IDs C1, C2, C3. Describe only visible anchors.
• No invisible psychology, backstory, contradictory traits, or excessive costume detail.
• If reference images are attached (labeled above), analyze their visual design: art style, color palette, distinctive features, silhouette, costume details. Incorporate those specific observed details. Place @[character A], @[character B], or @[character ref] at appropriate points in the prompt.

ENVIRONMENT IMAGES:
• If an environment reference image is attached, analyze space, lighting, atmosphere, textures, scale. Incorporate. Place @[environment ref] in the prompt.

VISUAL STYLE — inside panels:
• Monochrome light-gray rough sketch only. No color fills, no rendered shadows, no colored effects or backgrounds inside panels.
• Color accents and final style only in the project card, director strip, and outside panel areas.

SPATIAL CONTINUITY LOCK:
• Include only when needed: continuous shots, room returns, pursuit geography, fragile set geometry, or panels where the model might redesign the set.
• When included, name exact locked panels, camera axis, visible anchors, and only allowed changes.`

const VIDEO_SYSTEM = `You are a professional video prompt engineer generating a Seedance 2.0 storydance-compatible video prompt. The user will paste this output directly into Seedance 2.0.

${OUTPUT_ONLY}

━━━ STORYDANCE STRUCTURE — use EXACTLY in this order ━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — Start with this EXACT paragraph, word for word:
"Use @image1 as the authoritative director-approved storyboard blueprint for the sequence. Treat every storyboard panel as a consecutive shot within a single cinematic sequence. Follow panel order exactly and do not invent alternative coverage. Do not render the storyboard sheet itself. Preserve camera placement, framing, lens intent, shot scale, character staging, screen direction, environmental geography, prop placement, action choreography, continuity and emotional escalation shown by the storyboard. The storyboard is the primary source of truth for visual storytelling. Recreate the filmed sequence implied by the panels rather than the physical storyboard artwork."

STEP 2 — Continuous/one-shot boards only (special mode = one-shot-continuous or loop):
Add immediately after step 1: "The entire video must play as one continuous developing master shot with no visible cuts; each panel is a sampled phase of the same uninterrupted camera move, not a separate shot. Use one virtual lens / same-lens continuous camera move; scale changes come from physical camera movement only."
Skip this step for all other modes.

STEP 3 — Exactly ONE character reference sentence, choose one:
• If character reference image is attached: "Use @image2 as the authoritative [character name or C1] character reference."
• If no character reference image: "Use the identity details in this prompt as the character reference."
Do NOT write both. Do NOT skip this sentence.

STEP 4:
ENVIRONMENT: [compact location, spatial anchors, lighting sources, surfaces, atmosphere, prop continuity locks — everything the video model needs to maintain set geography]

STEP 5:
EMOTIONAL GUIDANCE:
Valence: [trajectory — e.g. neutral → grief → resolve / low-negative to slightly-positive]
Arousal: [trajectory — e.g. calm → building → sustained intensity / low to medium-high]
[One sentence applying Valence+Arousal to character body language, camera rhythm, lighting, atmosphere, and pacing]

STEP 6:
VISUAL STYLE: [compact final-video style — medium/look + lighting behavior + palette/grade + texture/finish + motion quality + render quality + effect style. Self-contained.]

STEP 7:
AUDIO: No background music or score. Use only diegetic ambience, foley, impacts, texture, and silence.
[If user specified music or audio, replace the above with one compact line describing the requested audio role]

STEP 8:
PANEL BEATS:
P01: [plain cinematic action — visible subject action, camera/framing when important, environment motion, effect state, continuity, SFX]
P02: [...]
[One P##: line per storyboard panel. Short, direct, imperative. Plain video language only.]

━━━ ABSOLUTE PROHIBITIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEVER include in the output:
• FORMAT: lines
• SUBJECTS: lines
• MOOD: lines
• COLOR LOGIC sections
• Timestamps, time ranges, seconds, or timeline labels anywhere
• The sentence "Do not use timestamps, time ranges, seconds, or timeline labels."
• Standalone "Keep prop continuity", "Keep continuity", or similar "Keep..." lines
• Both @image2 AND identity-details character reference sentences (exactly one only)
• Unresolved bracketed instructions like [For continuous...] or [Write exactly one...]
• RHY, ESC, lens charts, panel headers, or director-strip labels inside PANEL BEATS

━━━ REQUIREMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• EMOTIONAL GUIDANCE must use explicit "Valence:" and "Arousal:" labels
• VISUAL STYLE is required (not "Final style" or any other label)
• AUDIO line is required
• PANEL BEATS must have one P##: per storyboard panel
• Total output must stay under 3000 characters — compress panel beats first if over limit
• Essential prop/state/spatial continuity goes inside ENVIRONMENT or relevant PANEL BEATS — not as standalone "Keep..." lines
• Keep it direct and imperative — this is a video generation prompt, not production notes`

// ─── SYSTEM PROMPT DISPATCH ───────────────────────────────────────────────────

function buildSystemPrompt(module: string): string {
  switch (module) {
    case 'character':
      return `You are a professional cinematic AI prompt engineer for film and animation production. Generate a single, detailed GPT Image 2 character prompt based on the provided details. The prompt must be dense, production-ready, and formatted as one cohesive paragraph including physical description, clothing, lighting, mood, camera angle, and technical style. ${OUTPUT_ONLY}`

    case 'character-sheet':
      return `You are a professional cinematic AI prompt engineer specializing in character documentation and identity boards for film/animation production. Generate a GPT Image 2 character sheet prompt using the cinematic identity board template. Include: character identity board layout reference, multiple angles or expressions if relevant, style notes, lighting, color palette, technical specifications. When a character reference image is provided (labeled above), carefully analyze its visual content — art style, color palette, distinctive facial features, design language, silhouette, costume details — and weave those specific observed details into the prompt. Place @[character ref] at the point where this reference should be attached in GPT Image 2. ${OUTPUT_ONLY}`

    case 'storyboard':
      return STORYBOARD_SYSTEM

    case 'storyboard-parse':
      return `You are a professional script supervisor and storyboard coordinator. Extract structured filmmaking metadata from the provided screenplay or shot list text. Return a JSON object with these exact keys (use empty strings for missing fields): projectTitle, metaLine, microBrief, genreTone, scenePremise, location, startToEnd, actionChain, mustRead, emotionalArc, characterSlotA, characterSlotB. Return ONLY valid JSON, no other text.`

    case 'video':
      return VIDEO_SYSTEM

    case 'logo':
      return `You are a professional motion graphics and cinematic logo animation prompt engineer. Generate a Seedance 2.0 video prompt for a 10-beat cinematic logo reveal sequence. Each beat flows into the next. Weave together logo appearance, environment transitions, lighting, camera movement, and sound design descriptors. When a logo reference image is provided (labeled above), carefully analyze its graphic design — exact shape language, letterform style, line weights, color values, negative space, texture, proportions — and reference those specific visual details throughout. Place @[logo ref] near the beginning of the prompt where Seedance 2.0 should use this reference. ${OUTPUT_ONLY}`

    default:
      return `You are a professional cinematic AI prompt engineer. ${OUTPUT_ONLY}`
  }
}

// ─── USER MESSAGES ────────────────────────────────────────────────────────────

function buildUserMessage(body: Record<string, unknown>): string {
  const { module } = body as { module: string }

  switch (module) {
    case 'character': {
      const d = body as {
        subjectDescription: string; visualStyle: string; wardrobe: string
        mood: string; setting: string; technicalStyle: string
      }
      return `Generate a GPT Image 2 character prompt:
SUBJECT: ${d.subjectDescription}
VISUAL STYLE: ${d.visualStyle}
WARDROBE: ${d.wardrobe}
MOOD: ${d.mood}
SETTING: ${d.setting}
TECHNICAL STYLE: ${d.technicalStyle}`
    }

    case 'character-sheet': {
      const d = body as {
        characterName: string; role: string; coreMood: string
        visualSignature: string; style: string; characterContext?: string
        characterRef?: ImageRef | null
      }
      return `Generate a GPT Image 2 character sheet prompt:
CHARACTER NAME: ${d.characterName}
ROLE: ${d.role}
CORE MOOD: ${d.coreMood}
VISUAL SIGNATURE: ${d.visualSignature}
SHEET STYLE: ${d.style}
${d.characterContext ? `CHARACTER CONTEXT FROM MODULE 01: ${d.characterContext}` : ''}
${d.characterRef ? 'CHARACTER REFERENCE IMAGE: attached above — analyze and incorporate visual details; include @[character ref] in the output' : ''}`
    }

    case 'storyboard': {
      const d = body as {
        projectTitle: string; metaLine: string; microBrief: string; genreTone: string
        panelCount: number; gridLayout: string; storyboardFormat: string
        characterSlotA: string; characterSlotB: string; environmentReference: string
        scenePremise: string; location: string; startToEnd: string; actionChain: string
        mustRead: string; emotionalArc: string; styleLocks: string; effectLocks: string
        environmentLocks: string; spatialContinuityLock: string; panelHeaders: string[]
        rhythmTrack: string; escalationMap: string
        characterRefA?: ImageRef | null; characterRefB?: ImageRef | null; environmentImageRef?: ImageRef | null
      }

      const pad = (n: number) => String(n).padStart(2, '0')
      const headerList = d.panelHeaders
        .map((h, i) => `P${pad(i + 1)}: ${h || '(auto)'}`)
        .join(' | ')

      const imageNotes = [
        d.characterRefA  && '• Character A reference image attached above → analyze design; include @[character A] in the output',
        d.characterRefB  && '• Character B reference image attached above → analyze design; include @[character B] in the output',
        d.environmentImageRef && '• Environment reference image attached above → analyze space, lighting, atmosphere; include @[environment ref] in the output',
      ].filter(Boolean).join('\n')

      const rhythmNote = d.rhythmTrack
        ? `USER-SUPPLIED (validate format, correct to RHY P##: tempo / block / beat-feel if wrong):\n${d.rhythmTrack}`
        : 'AUTO-GENERATE — use strict format: RHY P##: [tempo] / [block] / [beat-feel] for each panel'
      const escalationNote = d.escalationMap
        ? `USER-SUPPLIED (validate format, correct to ESC P##: L# / curve if wrong):\n${d.escalationMap}`
        : 'AUTO-GENERATE — use strict format: ESC P##: L# / [curve] for each panel'

      return `Generate a Kōda-formatted GPT Image 2 storyboard sheet prompt using the scene data below. Map each field to its corresponding template section.

TITLE: ${d.projectTitle}
META LINE: ${d.metaLine}
GENRE/TONE: ${d.genreTone}
MICRO BRIEF: ${d.microBrief}
PANEL COUNT: ${d.panelCount}
GRID: ${d.gridLayout || 'AUTO'}
STORYBOARD FORMAT: ${d.storyboardFormat}

CHARACTERS:
C1: ${d.characterSlotA || '(describe from context)'}
${d.characterSlotB ? `C2: ${d.characterSlotB}` : '(no second character)'}

SCENE DATA:
Premise: ${d.scenePremise}
Location: ${d.location}${d.environmentReference ? ` — ${d.environmentReference}` : ''}
Start → End: ${d.startToEnd}
Action Chain: ${d.actionChain}
Must Read: ${d.mustRead}
Emotional Arc: ${d.emotionalArc}

STYLE:
Style Locks: ${d.styleLocks}
Effect Locks: ${d.effectLocks}
Environment Locks: ${d.environmentLocks}
Spatial Continuity: ${d.spatialContinuityLock || '(omit SPATIAL CONTINUITY LOCK if not needed)'}

PANEL HEADERS (use in DIRECTOR STRIP PANEL HEADERS plan line):
${headerList}

RHYTHM TRACK:
${rhythmNote}

ESCALATION MAP:
${escalationNote}
${imageNotes ? `\nIMAGE REFERENCE INSTRUCTIONS:\n${imageNotes}` : ''}`
    }

    case 'storyboard-parse': {
      const d = body as { screenplayInput: string }
      return `Extract filmmaking metadata from this text:\n\n${d.screenplayInput}`
    }

    case 'video': {
      const d = body as {
        emotionalGuidance: string; audioNotes: string; styleDescription: string
        promptStyle: string; specialMode: string; storyboardContext?: string
        storyboardImageRef?: ImageRef | null; characterImageRef?: ImageRef | null
      }

      const isContinuous = d.specialMode === 'one-shot-continuous' || d.specialMode === 'loop'
      const hasCharacterImg = !!d.characterImageRef

      return `Generate a Seedance 2.0 storydance video prompt.

CONFIGURATION:
Prompt Style: ${d.promptStyle}
Special Mode: ${d.specialMode}${isContinuous ? ' → ADD the one-continuous-shot sentence after the blueprint paragraph' : ''}

USER INPUTS:
Emotional Guidance: ${d.emotionalGuidance || '(derive from storyboard context)'}
Audio Notes: ${d.audioNotes || '(use default: no score, diegetic only)'}
Style Description: ${d.styleDescription || '(derive from storyboard style locks)'}

STORYBOARD CONTEXT:
${d.storyboardContext || '(no storyboard loaded — build from available context)'}

CHARACTER REFERENCE:
${hasCharacterImg ? 'Character reference image attached above → use @image2 sentence' : 'No character reference image → use identity-details fallback sentence'}

EMOTIONAL GUIDANCE INSTRUCTIONS:
Format EMOTIONAL GUIDANCE with explicit "Valence:" and "Arousal:" trajectory labels. Convert the user's emotional guidance input into Valence (positive/negative trajectory) + Arousal (calm/energetic trajectory), then apply to body language, camera rhythm, lighting, atmosphere, pacing in one sentence.

Generate the complete storydance prompt: blueprint paragraph → [continuous shot sentence if applicable] → character reference sentence → ENVIRONMENT → EMOTIONAL GUIDANCE → VISUAL STYLE → AUDIO → PANEL BEATS. Stay under 3000 characters.`
    }

    case 'logo': {
      const d = body as {
        logoDescription: string; environments: string[]
        logoImageRef?: ImageRef | null
      }
      const envList = d.environments
        .map((e, i) => `  Beat ${String(i + 1).padStart(2, '0')}: ${e || '(environment)'}`)
        .join('\n')
      return `Generate a Seedance 2.0 logo animation prompt:
LOGO DESCRIPTION: ${d.logoDescription}
${d.logoImageRef ? 'LOGO REFERENCE IMAGE: attached above — analyze graphic design; include @[logo ref] near the start of the output' : ''}
10-BEAT ENVIRONMENT SEQUENCE:
${envList}`
    }

    default:
      return 'Generate a cinematic prompt.'
  }
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const { module } = body as { module: string }

    if (module === 'storyboard-parse') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: buildSystemPrompt(module),
        messages: [{ role: 'user', content: buildUserMessage(body) }],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
      logGeneration(module, body, text)
      return new Response(text, { headers: { 'Content-Type': 'application/json' } })
    }

    const content = buildContent(module, body)

    // Storyboard prompts are large; video prompts need room to breathe too
    const maxTokens = module === 'storyboard' ? 4096 : module === 'video' ? 1500 : 2048

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      stream: true,
      system: buildSystemPrompt(module),
      messages: [{ role: 'user', content }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let full = ''
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            full += event.delta.text
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
        logGeneration(module, body, full)
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
