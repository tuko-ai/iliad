'use client'
import React from 'react'

interface FormFieldProps {
  label: string
  hint?: string
  children: React.ReactNode
  required?: boolean
}

export function FormField({ label, hint, children, required }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        style={{
          display: 'block',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-gold)',
          marginBottom: hint ? '0.2rem' : '0.4rem',
          fontWeight: 500,
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--color-red-ember)', marginLeft: '0.25rem' }}>*</span>
        )}
      </label>
      {hint && (
        <p
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            marginBottom: '0.4rem',
            lineHeight: 1.4,
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export function Input({ className, style, ...props }: InputProps) {
  return (
    <input
      className={`iliad-input ${className || ''}`}
      style={style}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export function Textarea({ className, style, ...props }: TextareaProps) {
  return (
    <textarea
      className={`iliad-input ${className || ''}`}
      style={{ resize: 'vertical', minHeight: '80px', ...style }}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}
export function Select({ options, className, style, ...props }: SelectProps) {
  return (
    <select
      className={`iliad-input iliad-select ${className || ''}`}
      style={style}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: 'var(--color-bg-input)' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

interface RadioGroupProps {
  name: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}
export function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((o) => (
        <label
          key={o.value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.7rem',
            border: `1px solid ${value === o.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: value === o.value ? 'var(--color-gold)' : 'var(--color-text-muted)',
            background: value === o.value ? 'var(--color-gold-muted)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            style={{ display: 'none' }}
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}
