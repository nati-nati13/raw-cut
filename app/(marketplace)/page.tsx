'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getMockFeaturedProducts, mockDesigners, mockProducts } from '@/lib/mock-data'

const SLIDE_COUNT = 6
const MARQUEE_ITEM = 'RAW CUT  ·  INDEPENDENT DESIGNERS  ·  TBILISI  ·  HANDMADE  ·  UNCUT TALENT  ·  SLOW FASHION  ·  '
const MARQUEE_TEXT = MARQUEE_ITEM.repeat(6)
const NAV_H = 64

export default function HomePage() {
  const featured = getMockFeaturedProducts()
  const designers = mockDesigners.slice(0, 6)
  const heroProducts = mockProducts.slice(0, 3)

  const [active, setActive] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>(Array(SLIDE_COUNT).fill(null))

  // Lock body scroll while on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Animate slides on enter + track active
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActive(idx)
            entry.target
              .querySelectorAll<HTMLElement>('.rc-anim, .rc-anim-img')
              .forEach(el => el.classList.add('in'))
          }
        }
      },
      { root: container, threshold: 0.4 }
    )

    slideRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const goTo = (i: number) =>
    slideRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })

  const SLIDE_H = `calc(100vh - ${NAV_H}px)`

  return (
    <>
      {/* ── Navigation dots ── */}
      <nav
        aria-label="Slide navigation"
        style={{
          position: 'fixed', right: '28px', top: '50%',
          transform: 'translateY(-50%)', zIndex: 100,
          display: 'flex', flexDirection: 'column', gap: '10px',
          mixBlendMode: 'difference',
        }}
      >
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: '6px',
              height: active === i ? '28px' : '6px',
              borderRadius: '3px',
              background: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'height 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        ))}
      </nav>

      {/* ── Scroll container ── */}
      <div
        ref={containerRef}
        className="rc-no-scrollbar"
        style={{
          position: 'fixed',
          top: `${NAV_H}px`,
          left: 0, right: 0, bottom: 0,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
        }}
      >

        {/* ══════════════════════════════════════════
            SLIDE 1 — HERO
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[0] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: 'var(--rc-ink)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Copy */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '56px 48px 56px 80px',
          }}>
            <span className="rc-anim" style={{
              display: 'block',
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--rc-chalk)', marginBottom: '28px',
            }}>
              Tbilisi · Independent Designers
            </span>

            <h1 className="rc-anim" data-d="1" style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(3.5rem, 5.5vw, 6rem)',
              fontWeight: 700, color: '#fff',
              lineHeight: 0.88, letterSpacing: '-0.04em', marginBottom: '28px',
            }}>
              Uncut<br />talent,<br />
              <em style={{ color: 'var(--rc-chalk)', fontStyle: 'italic' }}>curated<br />style.</em>
            </h1>

            <p className="rc-anim" data-d="2" style={{
              fontSize: '14px', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.45)', maxWidth: '360px', marginBottom: '36px',
            }}>
              Buy directly from independent fashion and product designers.
              Every piece is handmade, limited, and ships from the maker.
            </p>

            <div className="rc-anim" data-d="3" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/products" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px',
                backgroundColor: 'var(--rc-chalk)', color: 'var(--rc-ink)',
                borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              }}>
                Shop Collection
              </Link>
              <Link href="/designers" style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '14px 28px',
                backgroundColor: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
              }}>
                Meet Designers
              </Link>
            </div>

            {/* Stats */}
            <div className="rc-anim" data-d="4" style={{
              display: 'flex', gap: '32px', marginTop: '44px', paddingTop: '28px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              {[['250+', 'Designers'], ['2,000+', 'Pieces'], ['40+', 'Countries']].map(([v, l]) => (
                <div key={l}>
                  <p style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '1.75rem', fontWeight: 700, color: '#fff',
                    lineHeight: 1, letterSpacing: '-0.04em',
                  }}>{v}</p>
                  <p style={{
                    fontSize: '10px', color: 'rgba(255,255,255,0.32)',
                    marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product images — vertical strip */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '3px', overflow: 'hidden' }}>
            {heroProducts.map((p, i) => (
              <div key={p._id} className="rc-anim-img" data-d={String(i + 1)} style={{ position: 'relative', overflow: 'hidden' }}>
                {p.images[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="50vw" />
                  : <div style={{ position: 'absolute', inset: 0, backgroundColor: i % 2 === 0 ? '#2e2a28' : '#231f1d' }} />
                }
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute', bottom: '28px', left: '80px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--rc-chalk)', opacity: 0.35 }} />
            <span style={{
              fontSize: '9px', letterSpacing: '0.24em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
            }}>Scroll</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SLIDE 2 — STATS
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[1] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: 'var(--rc-linen)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden', position: 'relative', padding: '60px',
          }}
        >
          {/* Marquee top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            backgroundColor: 'var(--rc-ink)', overflow: 'hidden', padding: '14px 0',
          }}>
            <div className="rc-marquee-track">
              <span style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--rc-chalk)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{MARQUEE_TEXT}</span>
              <span aria-hidden style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--rc-chalk)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{MARQUEE_TEXT}</span>
            </div>
          </div>

          <div className="rc-anim" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--rc-dust)', marginBottom: '20px',
            }}>A new kind of marketplace</p>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 700, color: 'var(--rc-ink)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
            }}>
              Where craft meets{' '}
              <em style={{ color: 'var(--rc-chalk)', fontStyle: 'italic' }}>commerce.</em>
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            width: '100%', maxWidth: '880px',
          }}>
            {[
              { n: '250+', l: 'Independent\nDesigners', s: 'and growing' },
              { n: '2,000+', l: 'Unique\nPieces', s: 'handmade & limited' },
              { n: '40+', l: 'Countries\nReached', s: 'worldwide delivery' },
            ].map(({ n, l, s }, i) => (
              <div key={i} className="rc-anim" data-d={String(i + 1)} style={{
                padding: '44px 32px', textAlign: 'center',
                borderLeft: i > 0 ? '1px solid rgba(26,22,20,0.1)' : 'none',
              }}>
                <p style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: 'clamp(3.5rem, 6vw, 7rem)',
                  fontWeight: 700, color: 'var(--rc-ink)',
                  lineHeight: 1, letterSpacing: '-0.05em', marginBottom: '10px',
                }}>{n}</p>
                <p style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: 'var(--rc-dust)',
                  whiteSpace: 'pre-line', marginBottom: '4px',
                }}>{l}</p>
                <p style={{ fontSize: '11px', color: 'var(--rc-chalk)' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SLIDE 3 — HOW IT WORKS
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[2] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: 'var(--rc-paper)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '56px 80px', overflow: 'hidden', position: 'relative',
          }}
        >
          <div className="rc-anim" style={{ marginBottom: '44px' }}>
            <p style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--rc-dust)', marginBottom: '14px',
            }}>How it works</p>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
              fontWeight: 700, color: 'var(--rc-ink)',
              lineHeight: 0.9, letterSpacing: '-0.04em',
            }}>
              Shopping made <em style={{ fontStyle: 'italic' }}>simple.</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { n: '01', t: 'Discover', b: 'Browse handmade clothing, jewellery, objects, and prints from independent makers worldwide.' },
              { n: '02', t: 'Buy securely', b: 'RAW CUT handles payments — so designers focus on creating, not logistics.' },
              { n: '03', t: 'Receive from maker', b: 'Every order ships directly from the designer. Worldwide delivery, real craft.' },
            ].map(({ n, t, b }, i) => (
              <div key={i} className="rc-anim" data-d={String(i + 1)} style={{
                paddingTop: '36px', paddingBottom: '36px',
                paddingRight: i < 2 ? '36px' : 0,
                paddingLeft: i > 0 ? '36px' : 0,
                borderLeft: i > 0 ? '1px solid rgba(26,22,20,0.08)' : 'none',
              }}>
                <span style={{
                  display: 'block',
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '5rem', fontWeight: 700,
                  color: 'var(--rc-chalk)', lineHeight: 1,
                  letterSpacing: '-0.04em', marginBottom: '20px', opacity: 0.45,
                }}>{n}</span>
                <h3 style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '1.4rem', fontWeight: 600,
                  color: 'var(--rc-ink)', letterSpacing: '-0.025em', marginBottom: '10px',
                }}>{t}</h3>
                <p style={{
                  fontSize: '13px', lineHeight: 1.75,
                  color: 'var(--rc-dust)', maxWidth: '260px',
                }}>{b}</p>
              </div>
            ))}
          </div>

          <div className="rc-anim" data-d="4" style={{
            display: 'flex', gap: '32px', paddingTop: '28px',
            borderTop: '1px solid rgba(26,22,20,0.07)', marginTop: '8px',
          }}>
            {[['↗', 'Direct from makers'], ['⊕', 'Secure payments'], ['✦', 'Worldwide delivery']].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '11px', color: 'var(--rc-dust)', letterSpacing: '0.04em',
              }}>
                <span style={{ color: 'var(--rc-chalk)', fontSize: '13px' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SLIDE 4 — FEATURED WORK
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[3] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: 'var(--rc-ink)',
            display: 'flex', overflow: 'hidden',
          }}
        >
          {/* Left panel */}
          <div style={{
            width: '240px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '52px 32px',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div>
              <p className="rc-anim" style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--rc-chalk)', marginBottom: '16px',
              }}>Hand-picked</p>
              <h2 className="rc-anim" data-d="1" style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: '2.8rem', fontWeight: 700, color: '#fff',
                lineHeight: 0.9, letterSpacing: '-0.04em',
              }}>
                Featured<br /><em style={{ fontStyle: 'italic' }}>Work.</em>
              </h2>
            </div>
            <div className="rc-anim" data-d="2">
              <Link href="/products" style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--rc-chalk)', textDecoration: 'none',
              }}>
                View all →
              </Link>
            </div>
          </div>

          {/* Product mosaic */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '3px',
          }}>
            {featured.slice(0, 5).map((p, i) => (
              <Link
                key={p._id}
                href={`/products/${p.slug}`}
                style={{
                  position: 'relative', overflow: 'hidden', display: 'block',
                  gridColumn: i === 0 ? '1' : undefined,
                  gridRow: i === 0 ? '1 / span 2' : undefined,
                  textDecoration: 'none',
                }}
              >
                <div className="rc-anim-img" data-d={String(i)} style={{ position: 'absolute', inset: 0 }}>
                  {p.images[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="25vw" />
                    : <div style={{ position: 'absolute', inset: 0, backgroundColor: i % 2 === 0 ? '#2e2a28' : '#231f1d' }} />
                  }
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '20px 14px 12px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.68))',
                }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.52)', marginBottom: '2px' }}>
                    {p.designer.storeName ?? p.designer.name}
                  </p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SLIDE 5 — THE MAKERS
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[4] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: 'var(--rc-linen)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '56px 80px', overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginBottom: '40px',
          }}>
            <div>
              <p className="rc-anim" style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: 'var(--rc-dust)', marginBottom: '14px',
              }}>The community</p>
              <h2 className="rc-anim" data-d="1" style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
                fontWeight: 700, color: 'var(--rc-ink)',
                lineHeight: 0.9, letterSpacing: '-0.04em',
              }}>
                Meet the <em style={{ fontStyle: 'italic' }}>makers.</em>
              </h2>
            </div>
            <div className="rc-anim" data-d="2">
              <Link href="/designers" style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--rc-ink)', textDecoration: 'none',
              }}>
                All designers →
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '18px' }}>
            {designers.map((d, i) => (
              <Link
                key={d._id}
                href={`/designers/${d.username}`}
                className="rc-anim"
                data-d={String(Math.min(i + 2, 6))}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{
                  position: 'relative', aspectRatio: '3/4',
                  overflow: 'hidden', borderRadius: '6px',
                  marginBottom: '10px', backgroundColor: '#d5cfc5',
                }}>
                  {d.avatar
                    ? <Image src={d.avatar} alt={d.storeName ?? d.name} fill className="object-cover" sizes="17vw" />
                    : (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-fraunces)',
                          fontSize: '1.25rem', fontWeight: 700, color: 'var(--rc-dust)',
                        }}>
                          {(d.storeName ?? d.name).slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )
                  }
                </div>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: 'var(--rc-ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{d.storeName ?? d.name}</p>
                <p style={{ fontSize: '10px', color: 'var(--rc-dust)', marginTop: '2px' }}>
                  @{d.username}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SLIDE 6 — DESIGNER CTA
        ══════════════════════════════════════════ */}
        <div
          ref={el => { slideRefs.current[5] = el }}
          style={{
            height: SLIDE_H,
            scrollSnapAlign: 'start',
            backgroundColor: '#0d0b0a',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            textAlign: 'center', overflow: 'hidden',
            position: 'relative', padding: '60px',
          }}
        >
          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(212,168,83,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p className="rc-anim" style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--rc-chalk)', marginBottom: '28px',
          }}>For designers</p>

          <h2 className="rc-anim" data-d="1" style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 0.88, letterSpacing: '-0.04em',
            maxWidth: '660px', marginBottom: '28px',
          }}>
            Start selling your<br />
            <em style={{ color: 'var(--rc-chalk)', fontStyle: 'italic' }}>work today.</em>
          </h2>

          <p className="rc-anim" data-d="2" style={{
            fontSize: '14px', lineHeight: 1.75,
            color: 'rgba(255,255,255,0.38)', maxWidth: '360px', marginBottom: '44px',
          }}>
            Apply to sell on RAW CUT. We handle payments. You focus on making.
            Customers worldwide.
          </p>

          <div className="rc-anim" data-d="3" style={{ display: 'flex', gap: '12px' }}>
            <Link href="/register?role=designer" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '15px 36px',
              backgroundColor: 'var(--rc-chalk)', color: 'var(--rc-ink)',
              borderRadius: '100px', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>Apply now</Link>
            <Link href="/designers" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '15px 36px',
              backgroundColor: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '100px', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>See community</Link>
          </div>

          <p className="rc-anim" data-d="5" style={{
            position: 'absolute', bottom: '28px',
            fontSize: '10px', letterSpacing: '0.25em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.11)',
          }}>
            © 2024 RAW CUT — Tbilisi, Georgia
          </p>
        </div>

      </div>
    </>
  )
}
