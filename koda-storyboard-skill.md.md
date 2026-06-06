---
name: storyboard
description: "Generate compact clean rough-sketch storyboard sheet prompts from scene ideas or scripts. Use when the user asks for storyboard, previs board, animatic planning sheet, shot board, visual sequence planning, motion staging, camera/action/rhythm tracks, or storyboard-to-video handoff planning. Always save the storyboard prompt and video prompt as two .txt files inside a dedicated storyboard/<short_slug>/ folder and return only the saved file paths unless the user explicitly asks to print prompts."
argument-hint: "Describe the scene, title, genre, mood, characters, setting, panel count, grid, action beats, and any required camera or motion constraints"
---

# Storyboard Prompt Generator

Author: Kōda - x.com/aimikoda

Create compact production-oriented storyboard prompts optimized for image-model storyboard generation, video motion readability, staging, choreography planning, camera design, and artistic previs presentation.

Use the template in this skill for every storyboard request. Do not invent a new format unless the user explicitly requests a different one. Preserve section order. Keep wording visual, compact, and directly useful to an image model.

## Defaults

- Output language: English unless the user requests another language.
- Grid: `AUTO` unless the user specifies a panel count or grid.
- Panel count: choose only as many panels as the scene needs.
- Visual style: clean monochrome rough sketch storyboard, low detail, light-gray sketch lines, no color inside panel artwork.
- File output: save both prompts inside `storyboard/<short_slug>/`: `prompt_storyboard.txt` and `prompt_video.txt`.
- Video prompt length: `prompt_video.txt` must be under 3000 characters.
- Final answer: return only the saved file paths and a short confirmation. Do not print full prompts in chat unless the user explicitly asks.

## Workflow

1. Extract title, mood, genre, sequence goal, world, character count, required action beats, starting state, ending state, props, environment hazards, and cause-effect chain from the user request.
2. Run the required compact guidance pass before writing the prompt.
3. Extract continuity needs: sequence ID, separate character sheet role, style reference role, effect continuity, environment continuity, fixed anchor objects, and any panels that must share the exact same layout.
4. Apply character sanitization and identity consistency rules before writing the prompt.
5. Choose panel count and grid based on story complexity. Keep it minimal.
6. Build a clear sequence arc: master shot, immediate visual hook, readable cause-and-effect, escalation, emotional turn, active ending.
7. Define only the characters needed.
8. Write compact board-flow information in `DIRECTOR STRIP`, not detailed numbered panel descriptions under `SEQUENCE`.
9. Validate storyboard purity: panel images contain only visual staging; no labels, arrows, captions, overlays, repeated explanatory bodies, or confusing meta text.
10. Create a separate video prompt under 3000 characters that follows the `storydance` video-prompt structure: storyboard blueprint, no sheet rendering, panel-by-panel beats, no timestamps, no `FORMAT` / `SUBJECTS` / `MOOD` lines, `VISUAL STYLE`, `EMOTIONAL GUIDANCE`, and explicit `AUDIO`.
11. Save the storyboard sheet prompt and video prompt as separate `.txt` files inside `storyboard/<short_slug>/`.
12. Return only the saved paths and a short confirmation. Do not paste full prompts into chat unless requested.

## Required Compact Guidance Pass

Before creating any storyboard prompt, run this internal compact guidance pass. Do not read any external guidance file.

The visual model already understands common filmmaking language. Do not overexplain standard lens, shot, camera, edit, or style terms. Give compact, model-readable direction, then spend detail only on scene-specific continuity, action order, identity, prop/effect state, panel purity, and video handoff.

### Decision Order

1. Define the sequence intent in one sentence.
2. Identify start state, end state, main conflict, key prop/effect, and the one visual idea the board must communicate.
3. Choose the minimum panel count needed for clear cause-effect.
4. Add a master geography panel when space, direction, pursuit, doors, vehicles, combat, or multiple characters matter.
5. Pick a camera grammar: developing master, suspense reveal, action chase, emotional close progression, montage, parallel action, surreal shift, or simple coverage.
6. Select shot sizes, camera moves, and lens tags for each beat. Keep them physically and emotionally coherent.
7. Write each action as visible behavior with spatial relation and visible result.
8. Lock identity, wardrobe, props, screen direction, set anchors, effect state, and allowed changes.
9. Keep panel interiors monochrome rough sketch only. Put numbers, lens tags, notes, rhythm, and technical language outside panel image areas.
10. Write a video handoff using the rules in `Video Model Handoff`.

### Prompt Economy

- Trust common terms such as wide shot, close-up, 35mm, 85mm, handheld, dolly, rack focus, cut on action, and anamorphic.
- Be specific only where drift is likely: character identity, set layout, screen side, prop state, effect shape, camera continuity, and panel purity.
- Use short command phrases in the director strip. Avoid paragraph-heavy panel descriptions.
- Prefer one strong art direction over stacked style labels.

### Camera And Lens

- Choose shot size by story function: geography, action readability, reaction, detail, reveal, threat, intimacy, or scale.
- Use compact lens tags: `24mm wide`, `35mm`, `50mm`, `85mm portrait`, `telephoto`, `macro insert`, `anamorphic`.
- If exact focal length is not important, use a natural lens tag rather than a technical lecture.
- For continuous shots, use one virtual lens by default. If scale changes, make it physical camera movement, not unexplained lens jumps.
- Avoid contradictory camera language: random wide-to-telephoto shifts inside a same-lens move, push-in immediately followed by unmotivated pullback, or a new establishing shot when the intent is a wider view of the same layout.
- Useful phrases: `wide geography hold`, `low wide master`, `slow push-in`, `side track`, `handheld drift`, `locked-off symmetry`, `overhead tactical view`, `POV reveal`, `insert detail`, `reaction close-up`, `orbit hold`, `continuous pullback`, `final wide hold`.

### Editing And Rhythm

- For normal coverage, choose cuts by rhythm: hard cut, cut on action, insert, reaction cut, match cut, smash cut, jump cut, cross-cutting, object pass, or whip pan.
- For continuous boards, do not describe cuts. Describe one physical camera path and sampled phases of that move.
- Use transitions only when they serve genre or story. Do not decorate the board with transition language.
- Rhythm should vary. Avoid every panel feeling like the same tempo.
- Tempo values: `hold`, `slow reveal`, `build`, `burst`, `impact`, `pause`, `recover`, `final hit`.
- Block values: `short block`, `medium block`, `long block`.
- Beat-feel values: `clean beat`, `match beat`, `smash beat`, `held beat`, `whip beat`.
- Escalation intensity: `L1 calm`, `L2 tension`, `L3 rise`, `L4 surge`, `L5 peak`.
- Escalation curve: `flat`, `rise`, `spike`, `drop`, `release`, `unresolved`.

### Action Writing

Do not name emotions in action beats. Convert emotion into visible behavior.

Use this compact formula:

`trigger + movement + reaction + gesture + spatial relation + visible result`

Examples:

- `As the door cracks open, C1 stops short beside the bed, hand tightening on the blanket, forcing the frame toward the dark hallway.`
- `C2 crosses from background left toward the table, head turning toward the sound, blocking C1's exit path.`
- `The object slips from C1's hand, hits the floor, and redirects every eye-line to the lower foreground.`

Rules:

- One main action per panel.
- One readable body detail is enough.
- Always state spatial relation when action direction matters.
- Include a visible result when the action changes the frame.
- Avoid invisible psychology, backstory, abstract themes, and internal motives unless translated into pose, spacing, eye-line, or object state.

### Story And World

- Start from a familiar emotional or genre situation before adding strangeness.
- Show world rules through behavior, props, consequences, and repeated visual anchors.
- Introduce only the world details needed for this sequence.
- Use props as story logic: carried object, broken object, missing object, threshold, door, light, screen, tool, wound, vehicle, mark, trail.
- Make every panel advance action, emotion, geography, or consequence.
- End with impact, reveal, unresolved motion, pursuit, danger, collision, transformation, or a changed emotional meaning.

### Continuity Locks

Lock only what needs protection:

- Character ID, silhouette, wardrobe, key prop, movement quality.
- Screen side and direction of travel.
- Prop state: held, dropped, broken, glowing, open, closed, missing, damaged.
- Effect state: origin, thickness, intensity, trail direction, residue, spread.
- Set anchors: doors, windows, bed, table, corridor, vehicle, horizon, stairs, curtains, wall marks, light source.
- Camera axis: same axis, farther pullback, closer push, side track, orbit, overhead, locked-off.
- Allowed changes: camera distance, pose, eye-line, prop motion, damage state, light state, effect state.

When final panels return to the same location, state that the wider view is the same layout with more camera distance, not a redesigned establishing shot.

### Style And Color

- Storyboard panel interiors stay monochrome: light-gray rough sketch, simplified forms, readable poses, no color fills, no rendered lighting, no dense texture.
- Use color and final-video style only in project-card accents, panel header accents, director-strip bars/chips, optional style keyframes, `STYLE LOCKS`, and the separate video prompt.
- Visual style formula: `medium/look + lighting behavior + palette/grade + texture/finish + shadow language + effect style + environment style + motion quality`.
- Keep visual style compact and complete. If the user names a known style, translate it into descriptive neutral language. Keep identity details out of style.

### Sheet Purity

Panel image areas may contain only scene drawing: characters, environment, props, poses, effects shown as simple monochrome shapes, framing, and composition.

Panel image areas must not contain text, arrows, captions, speech bubbles, subtitles, labels, diagrams, UI, camera rigs, timing marks, motion arrows, technical overlays, duplicate bodies, ghost poses, colored lighting, colored effects, or finished concept-art rendering.

All metadata belongs in the project card, continuity header, panel header strip, director strip, sequence line, or video handoff.

## Core Rules

- The storyboard must guide motion, camera, and sequence flow while still feeling like an artistic previs board.
- The prompt must be complete enough to generate a coherent video if used alone, without external context.
- The video handoff must be complete enough to accompany the generated storyboard image when passed to a video model.
- Every storyboard must restate the scene premise, characters, location, action chain, start state, end state, visual style, and continuity constraints in compact language.
- Panel drawings must stay clean, sketch-like, low-detail, and easy to use as video reference.
- Panel image areas must be monochrome rough sketches only; do not color characters, props, effects, lighting, environment, or backgrounds inside panels.
- A panel must not show repeated copies of the same character to explain motion or effects; use one clear character pose per character per panel.
- Do not create dense black-and-white pencil art, charcoal rendering, concept-art illustration, finished rendering, or decorative drawing.
- Polish should come from sheet design, spacing, hierarchy, and clean composition, not from adding rendering detail inside the panels.
- Graphic design outside the panel images may be expressive, typographic, and scene-inspired as long as it supports readability.
- Each panel shows one clear action beat.
- Avoid filler shots and repeated camera angles unless intentional.
- Preserve spatial continuity and cause-and-effect.
- Prefer active endings with impact, danger, pursuit, collision, environmental interaction, motion continuation, or unresolved energy.
- Remove unnecessary repetition, abstract theory, backstory the image model cannot see, and verbose production language.
- Prefer short visual nouns and verbs over explanatory prose.

## Character Sanitization

Keep character information clean, stable, and image-safe.

- Use short character IDs: `C1`, `C2`, `C3`.
- Describe only visible identity anchors: age range, silhouette, hair, clothing shape, key prop, posture, and movement quality.
- Remove contradictory traits, excessive costume detail, invisible psychology, and backstory that cannot appear in a panel.
- If an identity or character sheet is provided, state that it controls face, body, wardrobe, and proportions.
- Do not redesign, age-shift, gender-shift, race-shift, beautify, caricature, or merge characters across panels.
- Do not use celebrity names, real-person likenesses, or copyrighted character identity unless the user explicitly supplied a permitted reference.

## Identity Consistency

Protect character continuity across the sheet.

- Keep each character's ID, silhouette, wardrobe, key prop, and screen side consistent.
- Mention identity once in `IDENTITY CONSISTENCY`, then use IDs in shots.
- Each panel plan should include the character ID only when needed for clarity.
- If the prompt uses a separate character sheet, write: `identity reference controls face, body, wardrobe, proportions; storyboard controls staging only`.
- Do not let style notes become character references.

## Storyboard Purity

Keep the output useful for a visual model.

- Panel interiors contain only the scene drawing: character poses, framing, environment, props, effects, and composition.
- No text, arrows, labels, captions, speech bubbles, subtitles, icons, diagrams, timing marks, camera rigs, UI, or technical overlays inside panel images.
- Put technical notes only in the panel header or director strip outside the image area.
- Avoid concepts that cannot be drawn directly: "viral", "cinematic quality", "emotional realism", "symbolic meaning", "psychological pressure" unless translated into visible pose, framing, light, spacing, or object state.
- Keep prompts compact enough that the model can follow them without resolving repeated or competing instructions.

## Master Shot Rule

Anchor the geography before complex action.

- Any sequence with multiple characters, pursuit, combat, vehicle motion, doorways, room transitions, or changing screen direction must include a master shot as Panel 01 or Panel 02.
- The master shot shows the full playable space: character positions, entrances/exits, main prop, hazard, foreground/midground/background, and screen direction.
- Do not start with an isolated close-up unless the scene is intentionally intimate and has no spatial action.
- Later close-ups must preserve the geography established by the master shot.

## Continuous Shot Camera Continuity

When the user asks for a continuous shot, one-shot, unbroken camera move, developing master shot, or no cuts, protect camera logic before writing the prompt.

- Treat every panel as a sampled phase of one physical camera path, not separate shots.
- Choose one primary virtual lens for the continuous move unless the user explicitly requests a visible zoom, lens change, or stylized camera break.
- If scale changes from close to wide or wide to close, explain it as physical camera distance, crane/jib movement, dolly movement, orbit radius, or motivated pullback/push-in, not unexplained lens jumps.
- Avoid camera contradictions such as `push then pull -> emotional push -> pullback`, `wide -> medium -> wide` without a physical path, or changing focal lengths across adjacent panels without a stated zoom logic.
- For a nightmare, dream, memory, or reality-shift continuous shot, the environment may transform around the camera, but the camera path must remain legible.
- If the camera reaches a closest point, do not add a second push immediately afterward unless it is a deliberate continued push on the same axis.
- If the final beat needs a full reveal, prefer: `approach/orbit -> closest point -> hold closest distance for reaction -> continuous pullback -> final wide hold`.
- In `CAMERA + LENS PLAN`, use continuity words such as `same-lens`, `closest point`, `hold distance`, `begin pullback`, `keep pulling wider`, and `settle into final wide hold`.
- In `[SEQUENCE]` and the video prompt, explicitly state `one virtual lens` or `same-lens continuous move` when it prevents the video model from inventing cuts.

## Spatial Continuity Lock

Use `SPATIAL CONTINUITY LOCK` only when a scene returns to, reveals, stabilizes, or pulls back inside the same location across multiple panels. It is required for continuous shots, final reveals, room transitions, vehicle interiors, table scenes, pursuit geography, and any panel pair where a model might redesign the set. Omit it for simple boards where fixed set geometry is not important.

- Name the exact panels that share one layout, such as `P08, P09, and P10`.
- State whether later panels are the same camera axis, a farther pullback, a push-in, a side track, or a hold, not a new shot.
- Lock visible anchors: main prop, character position, screen side, doors, windows, curtains, furniture silhouettes, wall seams, light direction, damage marks, vehicles, entrances/exits, horizon line, and foreground/midground/background relationships.
- Use wording like `P10 is not a new establishing shot` when a final wide or final reveal could be misread as a redesigned set.
- Explain the only allowed changes between locked panels: camera distance, character pose, eye-line, object motion, lighting state, or effect state.
- Repeat the same anchor logic in `STATE TRACK`, `CAMERA + LENS PLAN`, `[SEQUENCE]`, and the video prompt when continuity is fragile.
- If no fixed set geometry exists, write a short lock that says which continuity does matter, such as fall direction, screen direction, vehicle orientation, character side, or effect origin.

## Emotional Arc

Make the feeling visible and progressive.

- Add one compact `EMOTIONAL ARC` section to the output.
- Express emotion through posture, distance, eye-line, hand tension, blocking, pace, and framing.
- Use a simple progression such as `calm -> alarm -> decision -> impact -> unresolved dread`.
- Each panel beat should advance either action, emotion, or geography. Remove beats that do none of these.

## Compact Layout Rules

Use a compact sheet structure that an image model can parse quickly:

- Top: `PROJECT CARD` with title, mood/genre/energy, priority, and micro brief.
- Optional top strip: `CONTINUITY HEADER` when references or multi-part continuity matter.
- Middle: clean storyboard panels with only visual staging.
- Bottom: compact director strip aligned to panel columns.

Keep the project card, panels, and director strip visually separated. Use off-white paper, graphite-gray borders, even gutters, compact headers, and one or two restrained accent colors outside panel artwork only. Avoid tables, glossy UI, gradients, stickers, clutter, decorative icons, and long body text.

Each panel must have a small header strip outside the panel image area. Put the panel number, beat name, and camera lens tag in that outside header, never inside the drawing. Format the header as `P01 / [lens] / [beat]`, for example `P01 / 24mm wide / Alley master`.

## Compact Prompt Sections

Use these sections only; do not add extra explanatory sections unless the user explicitly asks.

- `PROJECT CARD`: title lockup, meta line, priority line, micro brief.
- `CONTINUITY HEADER`: sequence ID and reference priority.
- `SCENE PACKET`: premise, location, start/end state, action chain, props/effects, must-read idea.
- `CHARACTER SANITIZATION`: sanitized character IDs and visible identity anchors.
- `IDENTITY CONSISTENCY`: identity reference priority and consistency rules.
- `STORYBOARD PURITY`: panel image restrictions and visual-only clarity.
- `MASTER SHOT RULE`: geography anchor requirement.
- `EMOTIONAL ARC`: visible feeling progression.
- `STYLE LOCKS`: compact style, effect, and environment continuity.
- `SPATIAL CONTINUITY LOCK`: optional exact panel-to-panel set geography, camera-axis, anchor-object, and allowed-change rules when fixed layout continuity matters.
- `DIRECTOR STRIP`: compact visual animatic tracks plus panel header, camera/lens, rhythm, escalation, state, and style plans.
- `SEQUENCE`: grid and overall board structure only; no numbered panel descriptions.

## Visual Style

Panel artwork must be clean low-detail monochrome rough sketch: light-gray lines, simplified forms, gesture poses, simple environment shapes, no rendered shadows, no color fills, no colored lights/effects/backgrounds, no dense texture, no concept-art finish.

Panel numbers and lens notes are layout text outside the artwork only. They must not appear inside the panel image area.

## Director Strip

The director strip should read as a compact visual animatic track board, not a paragraph-heavy text area or decorative UI.

Use seven labeled horizontal tracks:

- `BEAT LINE`: short story and action beat labels
- `CAMERA PATH`: camera terms such as wide hold, push-in, side track, orbit, overhead, whip pan, crash-in, locked-off, pullback, tilt-up, tilt-down, handheld drift, slow reveal
- `ACTION PATH`: character, object, and environmental movement labels
- `RHYTHM TRACK`: strict `RHY P##: tempo / block / beat-feel` labels; never use seconds or timestamp durations
- `ESCALATION MAP`: strict `ESC P##: L# / curve` labels with `L1-L5` intensity bars
- `STATE TRACK`: compact continuity tokens for props, effects, screen direction, end pose, entry/exit side, doors, vehicles, damage, light state, or transformation state
- `STYLE TRACK`: very short explicit style tokens such as warm painterly glow, cyan-magenta palette, soft cel shadow, thick paint trail, grainy brush texture

Use compact panel-number chips, thin timeline lines, short one-to-three-word production labels, compact separators, rhythm blocks, and small intensity bars. Keep labels aligned by panel number. Each panel column should feel like a compact visual cell, not a sentence.

Include these compact plan lines inside `DIRECTOR STRIP` so `[SEQUENCE]` can stay minimal:

- `PANEL HEADERS`: `P01 / [lens] / [beat] -> P02 / [lens] / [beat] -> ...`
- `CAMERA + LENS PLAN`: `P01 [camera+lens] -> P02 [camera+lens] -> ...`
- `ACTION PATH`: `P01 [action] -> P02 [action] -> ...`
- `RHYTHM TRACK`: `P01 [RHY value] -> P02 [RHY value] -> ...`
- `ESCALATION MAP`: `P01 [ESC value] -> P02 [ESC value] -> ...`
- `STATE TRACK`: `P01 [state] -> P02 [state] -> ...`
- `STYLE TRACK`: `P01 [style token] -> P02 [style token] -> ...`

For continuous shots, the `CAMERA + LENS PLAN` must read as one uninterrupted path. Reuse the same virtual lens by default, and make each camera phrase causally follow the previous phrase. If the plan contains a push, pullback, orbit, crane, or lens change, check that the next panel could physically happen without a cut.

Use strict values for `RHYTHM TRACK` and `ESCALATION MAP` so the strip is readable:

- `RHYTHM TRACK` format per panel: `RHY P##: [tempo] / [block] / [beat-feel]`
- `tempo` allowed values: `hold`, `slow reveal`, `build`, `burst`, `impact`, `pause`, `recover`, `final hit`
- `block` allowed values: `short block`, `medium block`, `long block`
- `beat-feel` allowed values: `clean beat`, `match beat`, `smash beat`, `held beat`, `whip beat`
- `ESCALATION MAP` format per panel: `ESC P##: L# / [curve]`
- `L#` is intensity level `L1` to `L5`: `L1 calm`, `L2 tension`, `L3 rise`, `L4 surge`, `L5 peak`
- `curve` allowed values: `flat`, `rise`, `spike`, `drop`, `release`, `unresolved`
- Good examples: `RHY P03: burst / short block / smash beat`, `ESC P03: L4 surge / spike`
- Bad examples: `fast scary moment`, `more intense`, `high energy`, `dramatic rhythm`

Prefer graphic encoding over text volume: rhythm uses block length, escalation uses `L1-L5` bar height, camera uses short terms, action uses one strong verb phrase, state uses continuity tokens, and style continuity uses tiny explicit tokens such as warm glow, cyan-magenta palette, or soft cel shadow.

Do not include a color legend, icons, emojis, abstract marks, large arrows, or decorative graphics. The strip should communicate flow visually through alignment, rhythm, cell spacing, bar scale, and compact labels.

## Sequence Writing

- Do not include a separate `[SEQUENCE FORMAT]` section.
- Under `[SEQUENCE]`, write only one `Grid:` line.
- Do not write numbered panel descriptions under `[SEQUENCE]`.
- Do not include `Panel header:`, `Panel:`, `Camera:`, `Action:`, `Emotion:`, `Continuity:`, `Rhythm track:`, `Escalation map:`, or `Strip cell:` lines under `[SEQUENCE]`.
- Put any necessary panel order, lens, action, rhythm, escalation, state, or style details in compact `DIRECTOR STRIP` plan lines above `[SEQUENCE]`.
- Camera terms, action wording, rhythm, cuts, escalation, state continuity, and visual quality language should be selected from the compact guidance before writing the compact strip plans.

## Video Model Handoff

Add a text-only handoff after `[SEQUENCE]`. It is not part of the storyboard image and must not be drawn on the sheet.

Purpose: when the generated storyboard image is later sent to a video model, this handoff becomes the `storydance` source prompt. It should tell the video model how to read the storyboard image, ignore sheet layout, use character references, apply final visual style, and follow the panels as sequential cinematic beats.

Hard limit: the complete `prompt_video.txt` must be under 3000 characters. Compress before saving. Keep the blueprint paragraph, one character-reference sentence, `ENVIRONMENT`, `EMOTIONAL GUIDANCE`, `VISUAL STYLE`, `AUDIO`, and one `P##:` beat per panel. Remove repeated adjectives, duplicate continuity warnings, nonessential atmosphere/audio detail, and long panel descriptions first. For long boards, use one compact sentence per panel beat.

Use this structure:

- Start the video prompt with this exact paragraph: `Use @image1 as the authoritative director-approved storyboard blueprint for the sequence. Treat every storyboard panel as a consecutive shot within a single cinematic sequence. Follow panel order exactly and do not invent alternative coverage. Do not render the storyboard sheet itself. Preserve camera placement, framing, lens intent, shot scale, character staging, screen direction, environmental geography, prop placement, action choreography, continuity and emotional escalation shown by the storyboard. The storyboard is the primary source of truth for visual storytelling. Recreate the filmed sequence implied by the panels rather than the physical storyboard artwork.`
- Do not write the sentence `Do not use timestamps, time ranges, seconds, or timeline labels.` in the final video prompt.
- Do not output `FORMAT`, `SUBJECTS`, or `MOOD` lines.
- If the board is a developing master shot or continuous shot: `The entire video must play as one continuous developing master shot with no visible cuts; each panel is a sampled phase of the same uninterrupted camera move, not a separate shot.`
- If the board is a developing master shot or continuous shot and no zoom/lens change is required, add: `Use one virtual lens / same-lens continuous camera move; scale changes come from physical camera movement only.`
- If a character reference exists: `Use @image2 as the authoritative [character name / character ID] character reference.`
- If no separate character reference exists: `Use the identity details in this prompt as the character reference.`
- Write exactly one character-reference sentence. Do not include both the `@image2` version and the identity-details fallback.
- Do not add a standalone `Keep prop continuity`, `Keep continuity`, or similar `Keep...` continuity instruction. Put essential prop, state, and spatial continuity inside `ENVIRONMENT`, `EMOTIONAL GUIDANCE`, or the relevant `PANEL BEATS`.
- `ENVIRONMENT: [compact location and spatial anchors]`
- `EMOTIONAL GUIDANCE: [compact Valence: + Arousal: trajectory, applied to body language, camera rhythm, lighting, atmosphere, and pacing]`
- `VISUAL STYLE: [compact final-video style from STYLE LOCKS]`
- `AUDIO: No background music or score. Use only diegetic ambience, foley, impacts, texture, and silence.` unless the user explicitly requested music or provided audio.
- If music is explicitly requested or audio is provided, replace the no-music line with one compact `AUDIO:` line describing the requested music/audio role.
- Then write `PANEL BEATS:` with one `P##:` beat for each storyboard panel.

Panel beats should be plain video actions, not storyboard metadata. Each beat should include visible subject action, camera/framing when important, environment motion, effect state, continuity, and SFX. For a developing master shot, write the beats as phases of one uninterrupted camera move, not as separate edits. Do not include `RHY`, `ESC`, panel headers, lens charts, director-strip labels, timestamps, or sheet-design instructions inside `PANEL BEATS` unless the user explicitly asks. Keep each beat short enough that the full video prompt stays under 3000 characters.

Do not include `COLOR LOGIC` in the handoff. Use `VISUAL STYLE` only.

Keep the handoff direct and imperative. It should read like a video-generation prompt, not a production note or storyboard spec.

## File Output

Save every generated storyboard request as two plain text files inside its own folder.

- Use a short ASCII slug from the title or central scene idea.
- Create `storyboard/<short_slug>/` if it does not exist.
- Storyboard path: `storyboard/<short_slug>/prompt_storyboard.txt`.
- Video path: `storyboard/<short_slug>/prompt_video.txt`.
- Keep exactly these two prompt files in the generated prompt folder unless the user explicitly asks for extras.
- Save only the storyboard sheet prompt in the storyboard file.
- Save only the video prompt in the video file.
- In the final response, include only the saved file paths and a short confirmation. Do not include saved prompt text or code blocks unless the user explicitly asks.

## Storyboard Sheet Prompt Template

Output one compact, self-contained storyboard sheet prompt in `storyboard/<short_slug>/prompt_storyboard.txt`. Use only the section labels below so the image model understands layout, scene, panel logic, identity continuity, and director strip without needing external context. Do not include `[STORYBOARD SHEET PROMPT]` in the saved storyboard prompt.

```text
Create a 16:9 image.

[PROJECT CARD]
Create a compact designed masthead, not a table.
TITLE: [largest expressive scene-inspired title]
META LINE: [mood] / [genre] / [energy]
PRIORITY: [main visual readability priority]
MICRO BRIEF: [one compact sequence goal]

[CONTINUITY HEADER]
SEQUENCE ID: [production-safe id]
REFERENCE PRIORITY: [identity reference controls identity; this storyboard controls staging, motion, geography, continuity]

[SCENE PACKET]
PREMISE: [one sentence]
LOCATION: [place, time, spatial layout, hazards, usable surfaces]
START -> END: [starting positions/state -> ending positions/tension]
ACTION CHAIN: [compact cause-effect movement logic]
PROP / EFFECT STATE: [important objects, trails, damage, doors, lights, transformations]
MUST READ: [single most important visual idea]

[CHARACTER SANITIZATION]
C1: [sanitized visible anchors: age range, silhouette, hair, clothing shape, key prop, posture/movement]
C2: [only if needed]
Remove contradictory traits, invisible psychology, excessive costume detail, and backstory that cannot appear in a panel.

[IDENTITY CONSISTENCY]
[identity reference controls face/body/wardrobe/proportions if provided; keep character IDs, silhouette, wardrobe, key prop, and screen side consistent; do not redesign or merge characters]

[STORYBOARD PURITY]
Panel images are visual-only low-detail monochrome light-gray rough sketches. Put panel numbers, beat names, and lens tags in the header strip outside each panel image. No color, labels, arrows, captions, subtitles, logos, watermarks, timing marks, diagrams, UI, ghost poses, duplicate bodies, or technical overlays inside panels.

[MASTER SHOT RULE]
[Panel 01 or 02 shows full geography when the scene has multiple characters, pursuit, combat, vehicles, doors, room transitions, or changing screen direction]

[EMOTIONAL ARC]
[visible feeling progression through posture, spacing, eye-line, blocking, pace, and framing; e.g. calm -> alarm -> decision -> impact]

[STYLE LOCKS]
STYLE LOCK: [repeat complete visual medium, palette, lighting, texture, shadow, effect style]
EFFECT LOCK: [effect thickness, glow strength, edge softness, saturation, behavior]
ENVIRONMENT LOCK: [environment rendering style; no realistic texture drift or flat cartoon drift unless requested]

[DIRECTOR STRIP]
Bottom animatic track board aligned to panel columns. Tracks: BEAT LINE, CAMERA PATH, ACTION PATH, RHYTHM TRACK, ESCALATION MAP, STATE TRACK, STYLE TRACK. Use shot chips, thin lines, rhythm blocks, small intensity bars, one-to-three-word labels. No seconds or timestamps.
RHYTHM TRACK format: `RHY P##: [hold|slow reveal|build|burst|impact|pause|recover|final hit] / [short block|medium block|long block] / [clean beat|match beat|smash beat|held beat|whip beat]`.
ESCALATION MAP format: `ESC P##: [L1 calm|L2 tension|L3 rise|L4 surge|L5 peak] / [flat|rise|spike|drop|release|unresolved]`.
PANEL HEADERS: [P01 / lens / beat -> P02 / lens / beat -> P03 / lens / beat]
CAMERA + LENS PLAN: [P01 camera+lens -> P02 camera+lens -> P03 camera+lens]
ACTION PATH: [P01 action -> P02 action -> P03 action]
RHYTHM TRACK: [P01 RHY value -> P02 RHY value -> P03 RHY value]
ESCALATION MAP: [P01 ESC value -> P02 ESC value -> P03 ESC value]
STATE TRACK: [P01 state -> P02 state -> P03 state]
STYLE TRACK: [P01 style token -> P02 style token -> P03 style token]

[SEQUENCE]
Grid: [panel count + layout; one sentence describing the overall board structure, e.g. continuous developing master sheet, no cuts]
```

## Video Prompt Template

Output one compact, self-contained video prompt in `storyboard/<short_slug>/prompt_video.txt`. This text is not part of the storyboard image and must not be drawn on the sheet.

```text
Use @image1 as the authoritative director-approved storyboard blueprint for the sequence. Treat every storyboard panel as a consecutive shot within a single cinematic sequence. Follow panel order exactly and do not invent alternative coverage. Do not render the storyboard sheet itself. Preserve camera placement, framing, lens intent, shot scale, character staging, screen direction, environmental geography, prop placement, action choreography, continuity and emotional escalation shown by the storyboard. The storyboard is the primary source of truth for visual storytelling. Recreate the filmed sequence implied by the panels rather than the physical storyboard artwork.
[For continuous/developing-master boards only: write one sentence saying the entire video is one continuous developing master shot with no visible cuts.]
[For same-lens continuous boards only: write one sentence saying to use one virtual lens / same-lens continuous camera move.]
[Write exactly one character-reference sentence: use @image2 as the authoritative character reference, or use the identity details in this prompt as the character reference.]

ENVIRONMENT: [compact location, spatial anchors, lighting sources, surfaces, atmosphere, continuity locks]
EMOTIONAL GUIDANCE: [compact `Valence:` + `Arousal:` trajectory from beginning to shift to ending, applied to character body language, camera rhythm, lighting, atmosphere, and pacing]
VISUAL STYLE: [compact final-video style: medium, lighting behavior, palette, texture, atmosphere, motion quality, render quality, effect style]
AUDIO: [If music is not explicitly requested: No background music or score. Use only diegetic ambience, foley, impacts, texture, and silence. If music is requested or audio is provided: compactly describe the requested music/audio role.]

PANEL BEATS:
P01: [Panel 1 video beat in plain cinematic action language, with camera/framing, visible action, continuity, and SFX.]
P02: [Panel 2 video beat in plain cinematic action language, with camera/framing, visible action, continuity, and SFX.]
P03: [Panel 3 video beat in plain cinematic action language, with camera/framing, visible action, continuity, and SFX.]
```

## Validation

Before finalizing, verify:

- Saved storyboard file contains only the storyboard sheet prompt as plain text.
- Storyboard prompt is saved to `storyboard/<short_slug>/prompt_storyboard.txt`.
- Saved video file contains only the video prompt as plain text.
- Video prompt is saved to `storyboard/<short_slug>/prompt_video.txt`.
- Video prompt is under 3000 characters; verify with `wc -m storyboard/<short_slug>/prompt_video.txt` before finalizing.
- Storyboard and video prompts are separate files.
- Storyboard and video prompt files are in the same dedicated `storyboard/<short_slug>/` folder.
- Storyboard prompt uses the compact storyboard template sections.
- Storyboard prompt contains no `[STORYBOARD SHEET PROMPT]` text.
- Storyboard prompt contains no `[VIDEO MODEL HANDOFF]`, `PANEL BEATS`, `AUDIO`, `EMOTIONAL GUIDANCE`, or video-only handoff instructions.
- Video prompt contains no unresolved bracketed choice/instruction lines such as `[For continuous...]` or `[Write exactly one...]`; those must be either resolved into final prose or omitted.
- Compact guidance pass happened before writing the prompt.
- Section order matches the template.
- If fixed layout continuity matters, prompt includes `SPATIAL CONTINUITY LOCK` after `STYLE LOCKS` and before `DIRECTOR STRIP`; otherwise it is omitted.
- The top of the sheet includes a readable project card, not just abstract header text.
- Project card reads as a typographic masthead or production slate, not a table.
- Continuity header separates identity reference from storyboard staging/reference role.
- Character sanitization is applied: IDs, visible anchors, no contradictory or invisible identity details.
- Identity consistency is explicit: character sheet priority, stable silhouette, wardrobe, prop, screen side.
- Storyboard purity is enforced: no text, arrows, overlays, UI, diagrams, repeated explanatory bodies, or technical marks inside panel images.
- Panel numbers and lens tags sit outside panel image areas in the panel header strip.
- Each panel header uses `P## / [lens] / [beat]`.
- Master shot rule is followed when geography or multi-character action requires it.
- Emotional arc is present and visible through posture, spacing, eye-line, blocking, and framing.
- When present, spatial continuity lock names exact locked panels, camera axis, anchor objects, and only allowed changes.
- If a final reveal or wider pullback stays in the same place, it is described as the same layout with more camera distance, not a new establishing shot.
- Each storyboard is self-contained and restates the complete visual style in `STYLE LOCKS` instead of relying on previous prompts.
- Scene packet is complete enough to generate the video if this prompt is used alone.
- Start state, end state, action chain, props/effects, character goals, and location are explicit.
- No panel uses repeated copies of the same character to explain motion or effects unless the story literally contains clones.
- Panel artwork remains monochrome light-gray rough sketch; any color palette or accent color stays outside panel image areas.
- Sheet polish comes from spacing, hierarchy, margins, gutters, scene-inspired borders, typographic treatment, and restrained accent use.
- Panel image areas contain no technical overlays, arrows, labels, captions, diagrams, or notes.
- Director strip reads as a compact track board, not a paragraph-heavy text area.
- Director strip includes `STYLE TRACK` for compact visual continuity notes.
- Director strip includes `STATE TRACK` for prop/effect/screen-direction/end-pose continuity.
- Director strip includes compact `PANEL HEADERS`, `CAMERA + LENS PLAN`, `ACTION PATH`, `RHYTHM TRACK`, `ESCALATION MAP`, `STATE TRACK`, and `STYLE TRACK` plan lines.
- If the board is continuous/no-cut/developing-master, `CAMERA + LENS PLAN` reads as one physically possible camera path, not separate shot setups.
- If the board is continuous/no-cut/developing-master, adjacent panels do not contain unexplained focal-length jumps, repeated opposing pushes/pullbacks, or scale changes that imply cuts.
- If the board is continuous/no-cut/developing-master, `[SEQUENCE]` and the video prompt specify one virtual lens / same-lens continuity unless the prompt intentionally requires zoom or lens change.
- If the board is continuous/no-cut/developing-master and includes a final reveal, the camera path follows a clear logic such as approach/orbit -> closest point -> hold reaction -> continuous pullback -> final wide hold.
- If continuous/no-cut/developing-master panels share the same room or set, `SPATIAL CONTINUITY LOCK`, `STATE TRACK`, `CAMERA + LENS PLAN`, `[SEQUENCE]`, and the video prompt all prevent set redesign between those panels.
- `RHYTHM TRACK` uses the strict format `RHY P##: [tempo] / [block] / [beat-feel]`, never seconds.
- `ESCALATION MAP` uses the strict format `ESC P##: L# / [curve]` with `L1-L5` intensity.
- Rhythm and escalation values use the allowed vocab only, not vague mood phrases.
- Video prompt starts with the exact director-approved storyboard blueprint paragraph.
- Video prompt tells the model not to render the physical storyboard artwork and to recreate the filmed sequence implied by the panels.
- Video prompt uses the storydance-compatible structure: storyboard handoff sentence, `ENVIRONMENT`, `EMOTIONAL GUIDANCE`, `VISUAL STYLE`, `AUDIO`, and `PANEL BEATS`.
- Video prompt contains no `FORMAT`, `SUBJECTS`, or `MOOD` lines.
- Video prompt contains no `COLOR LOGIC`.
- Video prompt contains no timestamps, time ranges, seconds, or timeline labels unless the user explicitly requested timing.
- Video prompt does not contain the sentence `Do not use timestamps, time ranges, seconds, or timeline labels.`
- Video prompt contains no standalone `Keep prop continuity`, `Keep continuity`, or similar `Keep...` continuity line.
- When the board uses a developing master shot or continuous shot, the video prompt explicitly says the whole video is one continuous developing master shot with no visible cuts.
- Video prompt uses exactly one character-reference sentence: `@image2` when a separate character image exists, or identity details in the prompt when it does not.
- Video prompt `EMOTIONAL GUIDANCE` uses explicit `Valence:` and `Arousal:`.
- Video prompt includes `VISUAL STYLE`, not `Final style`.
- Video prompt includes an `AUDIO` line that says `No background music or score` unless the user explicitly requested music or provided audio.
- Video prompt includes `PANEL BEATS` with one `P##:` beat matching each storyboard panel.
- Video prompt panel beats use plain cinematic action language, not `RHY`, `ESC`, panel headers, lens charts, timestamps, or sheet-design instructions.
- `[SEQUENCE]` contains only one `Grid:` line and no numbered panel details.
- `[SEQUENCE]` does not include `Panel header:`, `Panel:`, `Camera:`, `Action:`, `Emotion:`, `Continuity:`, `Rhythm track:`, `Escalation map:`, or `Strip cell:` lines.
- Panel chips make each panel readable as one extractable beat.
- Visual style remains low-detail rough sketch, not finished concept art.
- Characters, props, environment, and screen direction remain spatially consistent.
