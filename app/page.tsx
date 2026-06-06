'use client'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const CharacterBuilder = dynamic(() => import('@/components/modules/CharacterBuilder'), { ssr: false })
const CharacterSheetBuilder = dynamic(() => import('@/components/modules/CharacterSheetBuilder'), { ssr: false })
const StoryboardBuilder = dynamic(() => import('@/components/modules/StoryboardBuilder'), { ssr: false })
const VideoPromptBuilder = dynamic(() => import('@/components/modules/VideoPromptBuilder'), { ssr: false })
const LogoAnimationBuilder = dynamic(() => import('@/components/modules/LogoAnimationBuilder'), { ssr: false })

const MODULES = [
  { id: 0, num: '01', label: 'CHARACTER', sub: 'GPT Image 2', component: CharacterBuilder },
  { id: 1, num: '02', label: 'CHAR SHEET', sub: 'GPT Image 2', component: CharacterSheetBuilder },
  { id: 2, num: '03', label: 'STORYBOARD', sub: 'GPT Image 2', component: StoryboardBuilder },
  { id: 3, num: '04', label: 'VIDEO', sub: 'Seedance 2.0', component: VideoPromptBuilder },
  { id: 4, num: '05', label: 'LOGO ANIM', sub: 'Seedance 2.0', component: LogoAnimationBuilder },
]

export default function Home() {
  const { activeModule, setActiveModule } = useStore()
  const ActiveComponent = MODULES[activeModule].component

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-void)' }}>

      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-base)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Logo bar */}
        <div
          style={{
            padding: '0 2rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            borderBottom: '1px solid var(--color-border-dim)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <h1
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '0.3em',
                color: 'var(--color-gold)',
                margin: 0,
                textShadow: '0 0 20px rgba(201, 162, 39, 0.4)',
              }}
            >
              ILIAD
            </h1>
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-text-dim)',
                borderLeft: '1px solid var(--color-border)',
                paddingLeft: '0.75rem',
              }}
            >
              AI Filmmaking Pipeline
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--color-text-dim)' }}>
              CLAUDE SONNET 4.6
            </span>
          </div>
        </div>

        {/* Module nav */}
        <nav style={{ padding: '0 2rem', display: 'flex', gap: 0 }}>
          {MODULES.map((m) => {
            const isActive = activeModule === m.id
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                style={{
                  position: 'relative',
                  padding: '0.75rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--color-gold)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.1rem',
                  transition: 'all 0.15s',
                  opacity: isActive ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '0.5' }}
              >
                <span
                  style={{
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    color: isActive ? 'var(--color-gold)' : 'var(--color-text-dim)',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                >
                  {m.num}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    fontSize: '0.55rem',
                    color: isActive ? 'var(--color-gold-dim)' : 'var(--color-text-dim)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {m.sub}
                </span>
              </button>
            )
          })}
        </nav>
      </header>

      {/* Pipeline flow indicator */}
      <div
        style={{
          padding: '0.5rem 2rem',
          background: 'var(--color-bg-base)',
          borderBottom: '1px solid var(--color-border-dim)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          overflowX: 'auto',
        }}
      >
        {MODULES.map((m, i) => (
          <span key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.05em',
                color: i <= activeModule ? 'var(--color-gold)' : 'var(--color-text-dim)',
                fontWeight: i === activeModule ? 700 : 400,
              }}
            >
              {m.label}
            </span>
            {i < MODULES.length - 1 && (
              <span style={{ color: 'var(--color-text-dim)', fontSize: '0.5rem' }}>→</span>
            )}
          </span>
        ))}
      </div>

      {/* Main content */}
      <main style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto' }}>
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: '4rem',
          padding: '1.5rem 2rem',
          borderTop: '1px solid var(--color-border-dim)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>
          ILIAD · AI FILMMAKING PIPELINE
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)' }}>
          Character → Character Sheet → Storyboard → Video → Logo
        </span>
      </footer>
    </div>
  )
}
