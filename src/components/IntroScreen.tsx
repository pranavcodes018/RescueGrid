
import { useState, type FormEvent } from 'react'

interface IntroScreenProps {
  onComplete: () => void
}

type Screen = 'landing' | 'login' | 'otp'

const DEMO_OTP = '123456'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

.rg-root, .rg-root * { box-sizing: border-box; }
.rg-root {
  --bg: #050b14;
  --panel: rgba(11, 24, 39, .88);
  --line: rgba(117, 172, 203, .17);
  --muted: #8da5b9;
  --white: #f1f8ff;
  --cyan: #5de4d2;
  --blue: #58a9ff;
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: auto;
  color: var(--white);
  background:
    radial-gradient(ellipse at 72% 35%, rgba(12, 103, 128, .18), transparent 38%),
    radial-gradient(ellipse at 15% 85%, rgba(23, 79, 144, .16), transparent 35%),
    var(--bg);
  font-family: 'DM Sans', sans-serif;
  isolation: isolate;
}
.rg-root button, .rg-root input { font: inherit; }
.rg-root button { cursor: pointer; }
.rg-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .18;
  background-image: linear-gradient(rgba(111,174,205,.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(111,174,205,.09) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: linear-gradient(to bottom, black, transparent 95%);
}
.rg-noise {
  position: absolute; inset: 0; pointer-events: none; opacity: .08;
  background: repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,.06) 4px);
}
.rg-topbar {
  position: relative; z-index: 2; display: flex; align-items: center;
  justify-content: space-between; padding: 25px clamp(20px, 5vw, 76px);
  border-bottom: 1px solid rgba(125, 175, 205, .11);
}
.rg-brand { display: flex; align-items: center; gap: 12px; }
.rg-brand-mark {
  width: 40px; height: 40px; display: grid; place-items: center;
  border: 1px solid rgba(93,228,210,.5); border-radius: 12px;
  background: linear-gradient(145deg, rgba(93,228,210,.18), rgba(88,169,255,.08));
  box-shadow: 0 0 28px rgba(93,228,210,.09);
}
.rg-brand-mark svg { width: 23px; height: 23px; }
.rg-brand-name {
  font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 700;
  letter-spacing: -.6px;
}
.rg-brand-name span { color: var(--cyan); }
.rg-brand-sub {
  display: block; margin-top: 2px; color: #7f98ad;
  font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1.7px;
}
.rg-status {
  display: flex; align-items: center; gap: 9px; color: #a5c0d0;
  font: 10px 'DM Mono', monospace; letter-spacing: 1.3px;
}
.rg-status-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--cyan);
  box-shadow: 0 0 12px rgba(93,228,210,.8); animation: rgPulse 2s infinite;
}
.rg-main {
  position: relative; z-index: 1; width: min(1190px, 100%);
  min-height: calc(100vh - 92px); margin: auto; padding: 46px 28px 35px;
  display: flex; align-items: center;
}
.rg-landing {
  width: 100%; display: grid; grid-template-columns: 1.05fr .95fr;
  gap: 28px; align-items: center; animation: rgEnter .65s ease both;
}
.rg-copy { padding: 24px 0 35px; }
.rg-eyebrow {
  display: inline-flex; align-items: center; gap: 9px;
  color: var(--cyan); font: 10px 'DM Mono', monospace; letter-spacing: 2px;
  text-transform: uppercase; margin-bottom: 26px;
}
.rg-eyebrow::before { content: ''; width: 25px; height: 1px; background: var(--cyan); }
.rg-heading {
  max-width: 620px; margin: 0; font: 600 clamp(44px, 5.5vw, 76px)/1.04 'Space Grotesk', sans-serif;
  letter-spacing: -4px;
}
.rg-heading em {
  color: var(--cyan); font-style: normal;
  text-shadow: 0 0 36px rgba(93,228,210,.12);
}
.rg-description {
  max-width: 490px; margin: 25px 0 29px; color: #9bb0c1;
  font-size: 15px; line-height: 1.85;
}
.rg-cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 14px;
  min-height: 55px; padding: 0 22px; color: #06131a;
  border: 1px solid rgba(93,228,210,.8); border-radius: 9px;
  background: linear-gradient(105deg, #72f0dc, #61cce4);
  font-weight: 700; font-size: 13px;
  box-shadow: 0 9px 35px rgba(42,204,190,.13);
  transition: transform .2s, box-shadow .2s, filter .2s;
}
.rg-cta:hover { transform: translateY(-2px); box-shadow: 0 13px 38px rgba(42,204,190,.23); filter: brightness(1.05); }
.rg-cta svg { width: 17px; height: 17px; }
.rg-trust {
  display: flex; flex-wrap: wrap; gap: 18px; margin-top: 28px;
  color: #8099ad; font: 10px 'DM Mono', monospace; letter-spacing: .5px;
}
.rg-trust span { display: flex; align-items: center; gap: 7px; }
.rg-trust svg { width: 14px; height: 14px; color: var(--cyan); }
.rg-visual {
  min-height: 435px; display: grid; place-items: center; position: relative;
  perspective: 850px;
}
.rg-globe-wrap {
  position: relative; width: min(370px, 82vw); aspect-ratio: 1;
  display: grid; place-items: center;
  animation: rgFloat 7s ease-in-out infinite;
}
.rg-globe {
  position: absolute; width: 65%; aspect-ratio: 1; border-radius: 50%;
  overflow: hidden; border: 1px solid rgba(93,228,210,.35);
  background:
    radial-gradient(circle at 34% 29%, rgba(74,211,207,.22), transparent 35%),
    radial-gradient(circle at 68% 70%, rgba(40,111,199,.23), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(13,57,83,.4), rgba(3,13,24,.98) 73%);
  box-shadow: inset -18px -8px 35px rgba(0,0,0,.55), 0 0 65px rgba(37,160,178,.12);
}
.rg-globe::before {
  content: ''; position: absolute; inset: -20%;
  background:
    repeating-linear-gradient(0deg, transparent 0 24px, rgba(93,228,210,.22) 25px, transparent 26px),
    repeating-linear-gradient(90deg, transparent 0 24px, rgba(93,228,210,.18) 25px, transparent 26px);
  border-radius: 50%; transform: rotate(-18deg);
  mask-image: radial-gradient(circle, black 40%, transparent 70%);
}
.rg-globe::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  background: linear-gradient(115deg, transparent 30%, rgba(93,228,210,.15), transparent 62%);
}
.rg-orbit {
  position: absolute; width: 92%; height: 36%; border: 1px solid rgba(93,228,210,.35);
  border-radius: 50%; transform: rotate(-32deg);
}
.rg-orbit-two {
  position: absolute; width: 91%; height: 44%; border: 1px solid rgba(88,169,255,.3);
  border-radius: 50%; transform: rotate(55deg);
}
.rg-orbit-three {
  position: absolute; width: 80%; height: 80%; border: 1px dashed rgba(93,228,210,.15);
  border-radius: 50%; transform: rotateX(62deg);
}
.rg-orbit-dot {
  position: absolute; top: 17%; right: 15%; width: 9px; height: 9px;
  background: var(--cyan); border-radius: 50%; box-shadow: 0 0 18px var(--cyan);
}
.rg-orbit-dot-two {
  position: absolute; left: 9%; bottom: 29%; width: 6px; height: 6px;
  background: var(--blue); border-radius: 50%; box-shadow: 0 0 15px var(--blue);
}
.rg-float-card {
  position: absolute; padding: 13px 15px; border: 1px solid rgba(114,174,204,.22);
  border-radius: 10px; background: rgba(6,18,31,.83); backdrop-filter: blur(12px);
  box-shadow: 0 15px 38px rgba(0,0,0,.2); animation: rgFloat 6s ease-in-out infinite;
}
.rg-float-card.one { top: 12%; right: -1%; }
.rg-float-card.two { bottom: 12%; left: -2%; animation-delay: -2s; }
.rg-card-label { color: #819bad; font: 9px 'DM Mono', monospace; letter-spacing: 1px; }
.rg-card-value { margin-top: 7px; color: var(--cyan); font: 19px 'Space Grotesk', sans-serif; }
.rg-card-note { margin-top: 3px; color: #718da1; font-size: 10px; }
.rg-mini-bars { display: flex; align-items: end; gap: 4px; height: 24px; margin-top: 7px; }
.rg-mini-bars i { width: 5px; border-radius: 2px; background: var(--cyan); opacity: .8; }
.rg-auth-layout {
  width: 100%; display: grid; place-items: center; animation: rgEnter .45s ease both;
}
.rg-auth-card {
  width: min(440px, 100%); padding: clamp(24px, 5vw, 39px);
  border: 1px solid rgba(117,172,203,.23); border-radius: 18px;
  background: linear-gradient(145deg, rgba(13,29,45,.94), rgba(6,16,29,.96));
  box-shadow: 0 28px 100px rgba(0,0,0,.35), inset 0 1px rgba(255,255,255,.025);
  backdrop-filter: blur(16px);
}
.rg-auth-icon {
  display: grid; place-items: center; width: 47px; height: 47px;
  margin-bottom: 25px; border: 1px solid rgba(93,228,210,.3);
  border-radius: 13px; color: var(--cyan); background: rgba(93,228,210,.08);
}
.rg-auth-icon svg { width: 23px; height: 23px; }
.rg-auth-kicker { color: var(--cyan); font: 10px 'DM Mono', monospace; letter-spacing: 2px; }
.rg-auth-title {
  margin: 12px 0 10px; font: 600 32px/1.15 'Space Grotesk', sans-serif;
  letter-spacing: -1.1px;
}
.rg-auth-desc { margin: 0 0 27px; color: #8fa6b9; font-size: 13px; line-height: 1.7; }
.rg-auth-label {
  display: block; margin: 17px 0 8px; color: #c3d2df;
  font-size: 12px; font-weight: 600;
}
.rg-input-wrap { position: relative; }
.rg-auth-input {
  display: block; width: 100%; height: 48px; padding: 0 13px;
  color: #edf7ff; border: 1px solid rgba(120,165,195,.24);
  border-radius: 8px; outline: none; background: rgba(2,10,19,.48);
  font-size: 13px; transition: border .2s, box-shadow .2s;
}
.rg-auth-input::placeholder { color: #627b8f; }
.rg-auth-input:focus { border-color: rgba(93,228,210,.7); box-shadow: 0 0 0 3px rgba(93,228,210,.08); }
.rg-password-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  border: 0; background: transparent; color: #8ca5b8; font-size: 11px;
}
.rg-auth-button {
  width: 100%; min-height: 49px; margin-top: 23px; display: flex;
  align-items: center; justify-content: center; gap: 10px;
  border: 1px solid rgba(93,228,210,.6); border-radius: 8px;
  background: linear-gradient(105deg, #72f0dc, #61cce4);
  color: #06131a; font-size: 13px; font-weight: 700;
  transition: transform .2s, filter .2s;
}
.rg-auth-button:hover { transform: translateY(-1px); filter: brightness(1.05); }
.rg-auth-button svg { width: 17px; height: 17px; }
.rg-auth-secondary {
  display: block; margin: 17px auto 0; padding: 6px;
  border: 0; color: #94adbf; background: transparent; font-size: 12px;
}
.rg-auth-secondary:hover { color: var(--cyan); }
.rg-auth-message {
  margin-top: 17px; padding: 11px 12px; border: 1px solid rgba(93,228,210,.2);
  border-radius: 8px; background: rgba(93,228,210,.06);
  color: #a8ddd8; font-size: 12px; line-height: 1.6;
}
.rg-auth-message.error {
  border-color: rgba(255,120,120,.28); background: rgba(255,100,100,.06); color: #ffb7b7;
}
.rg-demo-note {
  margin-top: 18px; padding: 12px; border: 1px dashed rgba(118,157,183,.23);
  border-radius: 8px; color: #8097aa; font-size: 11px; line-height: 1.65;
}
.rg-demo-note strong { color: #b8cbd9; }
.rg-otp-row { display: flex; gap: 8px; margin-top: 9px; }
.rg-otp-box {
  min-width: 0; flex: 1; height: 53px; text-align: center;
  color: var(--cyan); font: 700 21px 'DM Mono', monospace;
  border: 1px solid rgba(120,165,195,.28); border-radius: 8px;
  outline: none; background: rgba(2,10,19,.55);
}
.rg-otp-box:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(93,228,210,.07); }
.rg-footer {
  position: relative; z-index: 1; display: flex; justify-content: space-between;
  gap: 15px; padding: 17px clamp(20px, 5vw, 76px);
  border-top: 1px solid rgba(125,175,205,.1); color: #60798d;
  font: 9px 'DM Mono', monospace; letter-spacing: 1px;
}
.rg-footer span:last-child { text-align: right; }
@keyframes rgFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(.5deg); } }
@keyframes rgPulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes rgEnter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 800px) {
  .rg-landing { grid-template-columns: 1fr; gap: 0; }
  .rg-copy { padding: 30px 0 0; }
  .rg-heading { letter-spacing: -2.5px; }
  .rg-visual { min-height: 340px; }
  .rg-globe-wrap { width: min(300px, 76vw); }
  .rg-float-card.one { right: 0; }
  .rg-float-card.two { left: 0; }
  .rg-main { padding-top: 25px; }
}
@media (max-width: 480px) {
  .rg-topbar { padding: 17px 18px; }
  .rg-brand-name { font-size: 17px; }
  .rg-status { font-size: 8px; letter-spacing: .5px; }
  .rg-main { padding: 16px 20px 28px; }
  .rg-heading { font-size: 46px; }
  .rg-description { font-size: 14px; }
  .rg-visual { min-height: 290px; }
  .rg-footer { font-size: 8px; padding: 15px 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .rg-root *, .rg-root *::before, .rg-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    scroll-behavior: auto !important; transition-duration: .01ms !important;
  }
}
`

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 20 6v5c0 5.2-3.4 8.4-8 10-4.6-1.6-8-4.8-8-10V6l8-3Z" />
      <path d="m8.5 12 2.3 2.3 4.8-5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [screen, setScreen] = useState<Screen>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  function goToLogin() {
    setMessage('')
    setScreen('login')
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setMessageIsError(false)

    if (!email.trim() || !password) {
      setMessageIsError(true)
      setMessage('Please enter both your email address and password.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessageIsError(true)
      setMessage('Enter a valid email address to continue.')
      return
    }

    // Demo flow only: no real password authentication or email is performed.
    setOtp('')
    setScreen('otp')
    setMessage('Demo mode: your verification screen is ready. No email has been sent.')
  }

  function handleOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setMessageIsError(false)

    if (otp !== DEMO_OTP) {
      setMessageIsError(true)
      setMessage('Incorrect demo code. Enter 123456 to continue.')
      return
    }

    // This closes the intro overlay and reveals the existing RescueGrid dashboard.
    onComplete()
  }

  function resendDemoOtp() {
    setOtp('')
    setMessageIsError(false)
    setMessage('Demo verification code: 123456. This is a simulation; no email was sent.')
  }

  return (
    <div className="rg-root">
      <style>{CSS}</style>
      <div className="rg-grid" />
      <div className="rg-noise" />

      <header className="rg-topbar">
        <div className="rg-brand">
          <div className="rg-brand-mark"><ShieldIcon /></div>
          <div>
            <div className="rg-brand-name">Rescue<span>Grid</span></div>
            <span className="rg-brand-sub">EMERGENCY RESPONSE SYSTEM</span>
          </div>
        </div>
        <div className="rg-status">
          <span className="rg-status-dot" />
          SYSTEM SIMULATION READY
        </div>
      </header>

      <main className="rg-main">
        {screen === 'landing' && (
          <section className="rg-landing">
            <div className="rg-copy">
              <div className="rg-eyebrow">Disaster response intelligence</div>
              <h1 className="rg-heading">
                When every<br />
                second <em>matters.</em>
              </h1>
              <p className="rg-description">
                A decision-support command center for emergency resource
                allocation. Coordinate essential supplies, compare response
                strategies, and understand how every decision impacts
                vulnerable communities.
              </p>
              <button className="rg-cta" onClick={goToLogin}>
                Launch Command Center <ArrowIcon />
              </button>
              <div className="rg-trust">
                <span><ShieldIcon /> FAIRNESS-AWARE ALLOCATION</span>
                <span><LockIcon /> CONTROLLED DEMO ACCESS</span>
              </div>
            </div>

            <div className="rg-visual" aria-label="Animated abstract globe representing a connected emergency response network">
              <div className="rg-globe-wrap">
                <div className="rg-orbit" />
                <div className="rg-orbit-two" />
                <div className="rg-orbit-three" />
                <div className="rg-globe" />
                <div className="rg-orbit-dot" />
                <div className="rg-orbit-dot-two" />
                <div className="rg-float-card one">
                  <div className="rg-card-label">RESPONSE NETWORK</div>
                  <div className="rg-card-value">CONNECTED</div>
                  <div className="rg-card-note">Simulation environment</div>
                </div>
                <div className="rg-float-card two">
                  <div className="rg-card-label">RESOURCE MONITOR</div>
                  <div className="rg-card-value">ACTIVE</div>
                  <div className="rg-mini-bars">
                    {[10, 17, 13, 23, 16, 21, 14, 24, 18, 12, 22, 16].map((height, i) => (
                      <i key={i} style={{ height }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {screen === 'login' && (
          <section className="rg-auth-layout">
            <div className="rg-auth-card">
              <div className="rg-auth-icon"><LockIcon /></div>
              <div className="rg-auth-kicker">COMMAND CENTER ACCESS</div>
              <h1 className="rg-auth-title">Welcome back.</h1>
              <p className="rg-auth-desc">
                Enter your details to continue to the RescueGrid emergency
                response command center.
              </p>

              <form onSubmit={handleLogin}>
                <label className="rg-auth-label" htmlFor="rg-email">Email address</label>
                <div className="rg-input-wrap">
                  <input
                    id="rg-email"
                    className="rg-auth-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <label className="rg-auth-label" htmlFor="rg-password">Password</label>
                <div className="rg-input-wrap">
                  <input
                    id="rg-password"
                    className="rg-auth-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    style={{ paddingRight: 66 }}
                  />
                  <button
                    type="button"
                    className="rg-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <button className="rg-auth-button" type="submit">
                  Continue to verification <ArrowIcon />
                </button>
              </form>

              {message && (
                <div className={`rg-auth-message${messageIsError ? ' error' : ''}`} role="status">
                  {message}
                </div>
              )}

              <div className="rg-demo-note">
                <strong>Demo sign-in</strong><br />
                This prototype checks that the fields are filled in, but it does
                not authenticate or store your credentials. OTP delivery is simulated.
              </div>

              <button className="rg-auth-secondary" type="button" onClick={() => {
                setMessage('')
                setScreen('landing')
              }}>
                ← Back to landing page
              </button>
            </div>
          </section>
        )}

        {screen === 'otp' && (
          <section className="rg-auth-layout">
            <div className="rg-auth-card">
              <div className="rg-auth-icon"><MailIcon /></div>
              <div className="rg-auth-kicker">IDENTITY VERIFICATION</div>
              <h1 className="rg-auth-title">Verify access.</h1>
              <p className="rg-auth-desc">
                Enter the six-digit demo verification code to open the
                RescueGrid command center.
              </p>

              <div className="rg-demo-note" style={{ marginTop: 0, marginBottom: 20 }}>
                <strong>Demo verification code: 123456</strong><br />
                This code is shown for demonstration purposes. No email or SMS has been sent.
              </div>

              <form onSubmit={handleOtp}>
                <label className="rg-auth-label" htmlFor="rg-otp">Six-digit verification code</label>
                <input
                  id="rg-otp"
                  className="rg-auth-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="Enter 123456"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                    setMessage('')
                    setMessageIsError(false)
                  }}
                  required
                  style={{
                    height: 58,
                    textAlign: 'center',
                    letterSpacing: 9,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 22,
                  }}
                />

                <button className="rg-auth-button" type="submit">
                  Verify and open dashboard <ArrowIcon />
                </button>
              </form>

              {message && (
                <div className={`rg-auth-message${messageIsError ? ' error' : ''}`} role="status">
                  {message}
                </div>
              )}

              <button className="rg-auth-secondary" type="button" onClick={resendDemoOtp}>
                Resend demo code
              </button>
              <button className="rg-auth-secondary" type="button" onClick={() => {
                setMessage('')
                setMessageIsError(false)
                setScreen('login')
              }}>
                ← Back to sign in
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="rg-footer">
        <span>RESCUEGRID // DISASTER RESPONSE INTELLIGENCE</span>
        <span>SIMULATED ENVIRONMENT · DEMO ACCESS</span>
      </footer>
    </div>
  )
}
