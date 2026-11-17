'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Plus, Check } from 'lucide-react'
import { MOODS } from '@/lib/moods'
import { MoodGlyph } from './MoodGlyph'

/* ── Mood picker: a radiogroup of five weather tiles ──────────────── */

export function MoodPicker({
  value, onChange, variant = 'paper', compact = false, labelledBy, label = 'How are you feeling?',
}: {
  value: number | null
  onChange: (score: number) => void
  variant?: 'paper' | 'glass'
  compact?: boolean
  labelledBy?: string
  label?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const focusIndex = value ? value - 1 : 0

  const onKey = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + MOODS.length) % MOODS.length
    refs.current[next]?.focus()
    onChange(MOODS[next].score)
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} className="mood-grid">
      {MOODS.map((m, i) => {
        const checked = value === m.score
        return (
          <button
            key={m.score}
            ref={el => { refs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === focusIndex ? 0 : -1}
            className={`mood ${variant === 'glass' ? 'mood--glass' : ''} ${compact ? 'mood--compact' : ''}`}
            onClick={() => onChange(m.score)}
            onKeyDown={e => onKey(e, i)}
          >
            <MoodGlyph score={m.score} />
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── 1–5 scale as a row of chips ───────────────────────────────────── */

export function ScalePicker({
  options, value, onChange, labelledBy,
}: {
  options: { value: number; label: string }[]
  value: number | null
  onChange: (v: number) => void
  labelledBy?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(0, options.findIndex(o => o.value === value))
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (i + d + options.length) % options.length
    refs.current[n]?.focus()
    onChange(options[n].value)
  }
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="scale">
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={el => { refs.current[i] = el }}
          type="button" role="radio" aria-checked={value === o.value}
          tabIndex={i === idx ? 0 : -1}
          className="chip scale__chip"
          onClick={() => onChange(o.value)}
          onKeyDown={e => onKey(e, i)}
        >
          <span className="scale__n" aria-hidden="true">{o.value}</span>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ── Single-choice option rows ─────────────────────────────────────── */

export function OptionRows<T extends string>({
  options, value, onChange, labelledBy,
}: {
  options: { value: T; label: string; hint?: string }[]
  value: T | ''
  onChange: (v: T) => void
  labelledBy?: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(0, options.findIndex(o => o.value === value))
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (i + d + options.length) % options.length
    refs.current[n]?.focus()
    onChange(options[n].value)
  }
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} style={{ display: 'grid', gap: 10 }}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={el => { refs.current[i] = el }}
          type="button" role="radio" aria-checked={value === o.value}
          tabIndex={i === idx ? 0 : -1}
          className="option"
          onClick={() => onChange(o.value)}
          onKeyDown={e => onKey(e, i)}
        >
          <span>{o.label}</span>
          {o.hint ? <span className="option__hint">{o.hint}</span> : value === o.value ? <Check size={18} aria-hidden="true" /> : null}
        </button>
      ))}
    </div>
  )
}

/* ── Multi-select chips ────────────────────────────────────────────── */

export function ChipGroup({
  options, value, onChange, max, labelledBy, variant = 'paper',
}: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
  max?: number
  labelledBy?: string
  variant?: 'paper' | 'glass'
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter(v => v !== o))
    else if (!max || value.length < max) onChange([...value, o])
  }
  return (
    <div role="group" aria-labelledby={labelledBy} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const on = value.includes(o)
        return (
          <button key={o} type="button" aria-pressed={on} className={`chip ${variant === 'glass' ? 'chip--glass' : ''}`} onClick={() => toggle(o)}
            disabled={!on && !!max && value.length >= max}
            style={!on && !!max && value.length >= max ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
            {on && <Check size={16} aria-hidden="true" />}
            {o}
          </button>
        )
      })}
    </div>
  )
}

/* ── Switch ────────────────────────────────────────────────────────── */

export function Switch({
  checked, onChange, label, description, disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
      <div>
        <div id={`${id}-l`} className="t-label" style={{ fontSize: 16, fontWeight: 600 }}>{label}</div>
        {description && <div id={`${id}-d`} className="t-small muted" style={{ marginTop: 4 }}>{description}</div>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked}
        aria-labelledby={`${id}-l`} aria-describedby={description ? `${id}-d` : undefined}
        className="switch" onClick={() => onChange(!checked)} disabled={disabled}
        style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
      />
    </div>
  )
}

/* ── Accordion ─────────────────────────────────────────────────────── */

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const id = useId()
  return (
    <div>
      {items.map((it, i) => (
        <div key={it.q} className="acc">
          <h3 style={{ margin: 0, font: 'inherit' }}>
            <button
              type="button" className="acc__btn"
              aria-expanded={open === i} aria-controls={`${id}-${i}`} id={`${id}-b${i}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {it.q}
              <span className="acc__icon" aria-hidden="true"><Plus size={18} /></span>
            </button>
          </h3>
          <div id={`${id}-${i}`} role="region" aria-labelledby={`${id}-b${i}`} hidden={open !== i} className="acc__panel t-body">
            {it.a}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Text field with a visible label ───────────────────────────────── */

export function TextField({
  label, hint, error, multiline, ...rest
}: {
  label: ReactNode; hint?: ReactNode; error?: string; multiline?: boolean
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const describedBy = [hint ? `${id}-h` : '', error ? `${id}-e` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      {multiline
        ? <textarea id={id} className="input" aria-describedby={describedBy} aria-invalid={!!error} {...rest} />
        : <input id={id} className="input" aria-describedby={describedBy} aria-invalid={!!error} {...rest} />}
      {hint && <div id={`${id}-h`} className="field__hint">{hint}</div>}
      {error && <div id={`${id}-e`} className="field__error" role="alert">{error}</div>}
    </div>
  )
}
