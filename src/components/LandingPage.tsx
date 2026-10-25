
import { ArrowRight, ShieldCheck, Activity, Route, Radio } from 'lucide-react'
import './LandingPage.css'

type LandingPageProps = {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <main className="landing-page">
      <div className="landing-grid" />

      <header className="landing-header">
        <a className="landing-brand" href="#" aria-label="RescueGrid home">
          <span className="landing-logo"><ShieldCheck size={24} /></span>
          <span>
            <strong>RESCUEGRID</strong>
            <small>EMERGENCY RESPONSE INTELLIGENCE</small>
          </span>
        </a>
        <div className="landing-status">
          <span className="status-dot" /> RESPONSE SYSTEM
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-eyebrow">
            <span /> INTELLIGENCE FOR EMERGENCY RESPONSE
          </div>

          <h1>
            When every second
            <br />
            <span>matters.</span>
          </h1>

          <p>
            A smarter way to coordinate emergency resources, analyze road
            networks, and explore response strategies when every moment counts.
          </p>

          <div className="landing-actions">
            <button className="landing-primary" onClick={onGetStarted}>
              Enter command center <ArrowRight size={18} />
            </button>
            <span className="landing-demo-note">
              <ShieldCheck size={15} /> Interactive demo environment
            </span>
          </div>

          <div className="landing-stats">
            <div>
              <strong>01</strong>
              <span>Monitor incidents</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Analyze road networks</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Plan resource allocation</span>
            </div>
          </div>
        </div>

        <div className="landing-visual">
          <div className="visual-topline">
            <span>RESPONSE NETWORK</span>
            <span className="visual-live"><i /> DEMO MODE</span>
          </div>

          <div className="landing-radar">
            <div className="radar-ring ring-one" />
            <div className="radar-ring ring-two" />
            <div className="radar-ring ring-three" />
            <div className="radar-line radar-horizontal" />
            <div className="radar-line radar-vertical" />
            <div className="radar-sweep" />
            <span className="radar-point point-one" />
            <span className="radar-point point-two" />
            <span className="radar-point point-three" />
            <span className="radar-point point-four" />
            <div className="radar-center"><ShieldCheck size={38} /></div>
          </div>

          <div className="visual-bottomline">
            <span><Activity size={15} /> NETWORK ANALYSIS</span>
            <span><Radio size={15} /> SIMULATION READY</span>
          </div>

          <div className="landing-feature-list">
            <div>
              <span className="feature-icon"><Activity size={18} /></span>
              <span><strong>Situation awareness</strong><small>Explore incident information</small></span>
              <span className="feature-arrow">↗</span>
            </div>
            <div>
              <span className="feature-icon"><Route size={18} /></span>
              <span><strong>Road network intelligence</strong><small>Inspect connected routes</small></span>
              <span className="feature-arrow">↗</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>RESCUEGRID <span className="footer-divider">/</span> RESPONSE INTELLIGENCE</span>
        <span>CONCEPT DEMO · SIMULATED ENVIRONMENT</span>
      </footer>
    </main>
  )
}
