'use client'
import { useRef, useState } from 'react'
import type { ImageRef } from '@/lib/types'

interface ImageUploadProps {
  label: string
  hint?: string
  refTag: string
  value: ImageRef | null
  onChange: (ref: ImageRef | null) => void
  required?: boolean
}

const MAX_MB = 4

export function ImageUpload({ label, hint, refTag, value, onChange, required }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > MAX_MB * 1024 * 1024) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 3000)
      return
    }
    setSizeError(false)
    const reader = new FileReader()
    reader.onload = (e) => onChange({ dataUrl: e.target!.result as string, name: file.name })
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = () => setIsDragOver(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <label style={{
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          fontWeight: 500,
        }}>
          {label}
          {required && <span style={{ color: 'var(--color-red-ember)', marginLeft: '0.25rem' }}>*</span>}
        </label>
        <code style={{
          fontSize: '0.62rem',
          color: value ? 'var(--color-gold)' : 'var(--color-text-dim)',
          fontFamily: 'monospace',
          background: value ? 'var(--color-gold-muted)' : 'transparent',
          padding: value ? '0.1rem 0.35rem' : '0',
          borderRadius: '2px',
          transition: 'all 0.2s',
        }}>
          {refTag}
        </code>
      </div>

      {hint && (
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
          {hint}
        </p>
      )}

      {value ? (
        /* Filled state */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          background: 'var(--color-bg-input)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            flexShrink: 0,
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-surface)',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.dataUrl}
              alt="reference"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '0.72rem',
              color: 'var(--color-text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0.25rem',
            }}>
              {value.name}
            </p>
            <p style={{ fontSize: '0.62rem', color: 'var(--color-gold)', fontFamily: 'monospace' }}>
              {refTag}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              style={{
                marginTop: '0.2rem',
                fontSize: '0.6rem',
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              replace
            </button>
          </div>
          <button
            onClick={() => onChange(null)}
            title="Remove image"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '3px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-red-ember)'
              el.style.color = 'var(--color-red-ember)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'var(--color-border)'
              el.style.color = 'var(--color-text-muted)'
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* Empty drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{
            padding: '0.9rem 1rem',
            border: `1px dashed ${sizeError ? 'var(--color-red-ember)' : isDragOver ? 'var(--color-gold)' : 'var(--color-border)'}`,
            borderRadius: '4px',
            background: isDragOver ? 'var(--color-gold-muted)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '3px',
            border: `1px dashed ${isDragOver ? 'var(--color-gold)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isDragOver ? 'var(--color-gold)' : 'var(--color-text-dim)',
            fontSize: '0.85rem',
          }}>
            ⬆
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: isDragOver ? 'var(--color-gold)' : 'var(--color-text-muted)', margin: 0 }}>
              {sizeError
                ? `File too large — max ${MAX_MB}MB`
                : <>Drop image or <span style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>browse</span></>
              }
            </p>
            {!sizeError && (
              <p style={{ fontSize: '0.6rem', color: 'var(--color-text-dim)', margin: '0.15rem 0 0' }}>
                PNG · JPG · WEBP · max {MAX_MB}MB
              </p>
            )}
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onFileChange} style={{ display: 'none' }} />
    </div>
  )
}
