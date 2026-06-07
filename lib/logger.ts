import { appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const LOG_FILE = join(process.cwd(), 'logs', 'generations.log')

function sanitize(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (k === 'module') continue
    if (v === null || v === undefined || v === '') continue
    if (typeof v === 'string' && !v.trim()) continue
    // Replace ImageRef objects (contain large base64 payloads)
    if (v && typeof v === 'object' && 'dataUrl' in (v as Record<string, unknown>)) {
      out[k] = '[image attached]'
      continue
    }
    out[k] = v
  }
  return out
}

export function logGeneration(
  module: string,
  body: Record<string, unknown>,
  output: string,
) {
  try {
    mkdirSync(join(process.cwd(), 'logs'), { recursive: true })
    const entry = {
      ts: new Date().toISOString(),
      module,
      inputs: sanitize(body),
      output: output.slice(0, 500),
    }
    appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8')
  } catch {
    // Never let logging errors surface to the user
  }
}
