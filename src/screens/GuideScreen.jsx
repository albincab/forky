// Static in-app documentation: how the app works, key features, and an
// honest rundown of the free-API trade-offs — content lives in i18n so it
// stays in sync with the rest of the app's language.
import { useEffect } from 'react'
import { STORAGE_KEYS } from '../constants/storageKeys.js'

function StepLane({ icon, title, steps }) {
  return (
    <div className="guide-lane">
      <div className="guide-lane-head">{icon} {title}</div>
      <div className="guide-lane-steps">
        {steps.map((s, i) => (
          <div className="guide-step" key={s.title}>
            <span className="guide-step-num">{i + 1}</span>
            <span className="guide-step-txt">
              <b>{s.title}</b>{s.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GuideScreen({ t, onBack }) {
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUIDE_SEEN, '1')
  }, [])

  return (
    <div className="screen">
      {/* Masthead */}
      <div className="masthead">
        <button onClick={onBack} aria-label={t.back} type="button">← RETOUR</button>
        <span>★ {t.guideTitle.toUpperCase()}</span>
        <span></span>
      </div>

      <div>
        <div className="eyebrow">— comment ça marche, en clair —</div>
        <h1 className="display" style={{ fontSize: 30, marginTop: 6 }}>{t.guideTitle}</h1>
        <p style={{ marginTop: 10 }}>{t.guideIntro}</p>
      </div>

      {/* Teaser video */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', border: '1.5px solid var(--ink)' }}>
        <iframe
          src="https://www.youtube.com/embed/nDazwzaJju0"
          title="À TABLE! — teaser"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      <hr className="rule-thick" />

      {/* How it works */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>{t.guideHowTitle}</h2>
        <div className="waiting-banner" style={{ fontSize: 13 }}>
          👑 {t.guideHowIntro}
        </div>
        <div className="guide-flow">
          <StepLane icon="👑" title="Organisateur" steps={t.guideHowOrganizer} />
          <StepLane icon="🎟" title="Participant" steps={t.guideHowParticipant} />
        </div>
      </div>

      <hr className="rule-thick" />

      {/* Features */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>{t.guideFeaturesTitle}</h2>
        <div className="guide-grid2">
          {t.guideFeatures.map(f => (
            <div className="card" key={f.title}>
              <h3 style={{ marginBottom: 4 }}>{f.icon} {f.title}</h3>
              <p style={{ fontSize: 13 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="rule-thick" />

      {/* API limits */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>⚠️ {t.guideLimitsTitle}</h2>
        <p style={{ fontSize: 13 }}>{t.guideLimitsIntro}</p>
        <div className="flex-col" style={{ gap: 10 }}>
          {t.guideLimits.map(l => (
            <div className="card guide-limit" key={l.title}>
              <span className="guide-limit-sev" aria-hidden="true">{l.severity}</span>
              <div>
                <h3 style={{ marginBottom: 4 }}>{l.title}</h3>
                <p style={{ fontSize: 13 }}>{l.desc}</p>
                {l.mitigation && <p className="guide-mitigation">✓ {l.mitigation}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="rule-thick" />

      {/* FAQ */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>{t.guideFaqTitle}</h2>
        <div className="flex-col" style={{ gap: 8 }}>
          {t.guideFaq.map(item => (
            <details className="guide-faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <hr className="rule-thick" />

      {/* Roadmap */}
      <div className="flex-col" style={{ gap: 10 }}>
        <h2>{t.guideRoadmapTitle}</h2>
        <ul className="guide-roadmap">
          {t.guideRoadmap.map(item => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  )
}
