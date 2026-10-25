
import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  Radar,
  ShieldCheck,
  Waves,
  Zap,
} from 'lucide-react'

type IntroScreenProps = {
  onComplete: () => void
}

type AuthStep = 'login' | 'otp'

const DEMO_OTP = '123456'

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

.rg-root, .rg-root * { box-sizing: border-box; }
.rg-root {
  --rg-bg: #080c10;
  --rg-panel: rgba(16, 24, 30, .88);
  --rg-border: rgba(159, 190, 198, .14);
  --rg-muted: #83969e;
  --rg-white: #edf5f5;
  --rg-green: #8ef0c0;
  --rg-mono: 'DM Mono', monospace;
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: var(--rg-bg);
  color: var(--rg-white);
  font-family: 'Manrope', sans-serif;
  isolation: isolate;
}
.rg-root button, .rg-root input { font: inherit; }
.rg-root button { cursor: pointer; }
.rg-atmosphere {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(ellipse at 51% 34%, rgba(30, 115, 101, .19), transparent 35%),
    radial-gradient(ellipse at 90% 80%, rgba(35, 87, 117, .12), transparent 36%),
    linear-gradient(145deg, #0b1216, #080c10 65%);
}
.rg-grid {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: linear-gradient(rgba(144, 181, 184, .035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(144, 181, 184, .035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, black, transparent 92%);
}
.rg-topbar {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center; gap: 18px;
  padding: 26px clamp(20px, 5vw, 76px);
  border-bottom: 1px solid rgba(180, 209, 210, .08);
}
.rg-brand { display: flex; align-items: center; gap: 11px; }
.rg-brand-icon {
  display: grid; place-items: center; width: 38px; height: 38px;
  border: 1px solid rgba(142, 240, 192, .35); border-radius: 11px;
  color: var(--rg-green); background: rgba(142, 240, 192, .07);
}
.rg-brand-name { font-size: 14px; font-weight: 800; letter-spacing: .17em; }
.rg-brand-sub { margin-top: 4px; font: 9px var(--rg-mono); letter-spacing: .12em; color: var(--rg-muted); }
.rg-online {
  display: flex; align-items: center; gap: 9px; color: #a9c5bd;
  font: 10px var(--rg-mono); letter-spacing: .08em;
}
.rg-online-dot, .rg-eyebrow-dot {
  width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%;
  background: var(--rg-green); box-shadow: 0 0 12px rgba(142, 240, 192, .65);
}
.rg-layout {
  position: relative; display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr);
  align-items: center; gap: clamp(34px, 7vw, 112px);
  width: min(1200px, 100%); min-height: calc(100vh - 148px);
  margin: auto; padding: 52px clamp(20px, 5vw, 76px) 76px;
}
.rg-hero { position: relative; min-width: 0; }
.rg-kicker {
  display: flex; align-items: center; gap: 11px; margin-bottom: 24px;
  color: var(--rg-green); font: 10px var(--rg-mono); letter-spacing: .15em;
}
.rg-kicker-line { width: 25px; height: 1px; background: var(--rg-green); }
.rg-heading {
  margin: 0; font-size: clamp(42px, 5.5vw, 74px); font-weight: 600;
  line-height: 1.04; letter-spacing: -.065em;
}
.rg-heading em { color: var(--rg-green); font-style: normal; }
.rg-hero-copy {
  max-width: 455px; margin: 23px 0 0; color: #9aabb1;
  font-size: 14px; line-height: 1.9;
}
.rg-radar-wrap {
  position: relative; display: grid; place-items: center;
  width: min(100%, 410px); aspect-ratio: 1; margin: 22px auto -8px;
}
.rg-radar {
  position: relative; display: grid; place-items: center;
  width: 76%; aspect-ratio: 1; border-radius: 50%;
  border: 1px solid rgba(142, 240, 192, .15);
  background: radial-gradient(circle, rgba(27, 93, 78, .13), rgba(10, 20, 23, .05) 68%, transparent 69%);
}
.rg-ring { position: absolute; border: 1px solid rgba(142, 240, 192, .14); border-radius: 50%; }
.rg-ring-1 { inset: 12%; }
.rg-ring-2 { inset: 25%; }
.rg-ring-3 { inset: 38%; }
.rg-radar-cross { position: absolute; background: rgba(142, 240, 192, .11); }
.rg-radar-cross.x { height: 1px; width: 100%; }
.rg-radar-cross.y { width: 1px; height: 100%; }
.rg-sweep {
  position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0 72%, rgba(92, 227, 174, .16) 90%, transparent 100%);
  animation: rg-rotate 8s linear infinite;
}
.rg-radar-core {
  z-index: 1; display: grid; place-items: center; width: 82px; height: 82px;
  color: var(--rg-green); border: 1px solid rgba(142, 240, 192, .42);
  border-radius: 24px; background: rgba(12, 36, 31, .88);
  box-shadow: 0 0 50px rgba(74, 219, 167, .12), inset 0 0 22px rgba(74, 219, 167, .08);
  animation: rg-float 5s ease-in-out infinite;
}
.rg-blip { position: absolute; z-index: 2; width: 7px; height: 7px; border-radius: 50%; background: var(--rg-green); box-shadow: 0 0 13px var(--rg-green); }
.rg-blip.one { top: 23%; left: 61%; }
.rg-blip.two { top: 62%; left: 25%; width: 5px; height: 5px; background: #77b9ff; box-shadow: 0 0 12px #77b9ff; }
.rg-blip.three { bottom: 23%; right: 27%; width: 5px; height: 5px; }
.rg-radar-caption {
  position: absolute; left: 0; right: 0; bottom: 2%; display: flex;
  justify-content: center; gap: 20px; color: #71868b; font: 9px var(--rg-mono);
  letter-spacing: .08em;
}
.rg-radar-caption span { display: flex; align-items: center; gap: 7px; }
.rg-radar-caption i { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: var(--rg-green); }
.rg-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 2px; }
.rg-stat {
  padding: 14px 12px; border: 1px solid var(--rg-border);
  border-radius: 12px; background: rgba(15, 23, 28, .56);
}
.rg-stat-label { color: #82969c; font: 9px var(--rg-mono); letter-spacing: .05em; }
.rg-stat-value { margin-top: 9px; font-size: 18px; font-weight: 700; letter-spacing: -.04em; }
.rg-stat-value small { margin-left: 5px; color: var(--rg-green); font-size: 10px; font-weight: 500; }
.rg-auth-card {
  position: relative; padding: clamp(24px, 3.4vw, 39px);
  border: 1px solid rgba(163, 203, 205, .18); border-radius: 22px;
  background: linear-gradient(145deg, rgba(20, 30, 36, .95), rgba(12, 18, 23, .97));
  box-shadow: 0 24px 90px rgba(0, 0, 0, .26), inset 0 1px 0 rgba(255,255,255,.025);
}
.rg-auth-card::before {
  content: ''; position: absolute; top: -1px; left: 28px; width: 72px; height: 2px;
  background: var(--rg-green); box-shadow: 0 0 18px rgba(142, 240, 192, .6);
}
.rg-auth-eyebrow {
  display: flex; align-items: center; gap: 8px; color: var(--rg-green);
  font: 9px var(--rg-mono); letter-spacing: .13em;
}
.rg-auth-title { margin: 21px 0 9px; font-size: 29px; font-weight: 700; letter-spacing: -.055em; }
.rg-auth-subtitle { margin: 0 0 28px; color: #91a3a9; font-size: 12px; line-height: 1.8; }
.rg-field { display: block; margin-top: 18px; }
.rg-field-label {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  margin-bottom: 9px; color: #bdcbce; font-size: 11px; font-weight: 600;
}
.rg-input-wrap { position: relative; }
.rg-input-icon {
  position: absolute; top: 50%; left: 14px; transform: translateY(-50%);
  color: #758a91; pointer-events: none;
}
.rg-input {
  display: block; width: 100%; height: 48px; padding: 0 44px 0 43px;
  outline: none; color: #edf5f5; border: 1px solid rgba(153, 185, 190, .17);
  border-radius: 10px; background: rgba(5, 11, 15, .5); font-size: 12px;
  transition: border-color .2s, box-shadow .2s;
}
.rg-input::placeholder { color: #586b72; }
.rg-input:focus { border-color: rgba(142, 240, 192, .65); box-shadow: 0 0 0 3px rgba(142, 240, 192, .07); }
.rg-eye {
  position: absolute; top: 50%; right: 12px; transform: translateY(-50%);
  display: grid; place-items: center; padding: 5px; color: #81969c;
  border: 0; background: transparent;
}
.rg-auth-message {
  margin-top: 15px; padding: 11px 12px; border-radius: 9px;
  color: #a9d9c7; background: rgba(82, 186, 140, .08);
  border: 1px solid rgba(142, 240, 192, .2); font-size: 11px; line-height: 1.6;
}
.rg-auth-message.error {
  color: #ffb4ae; background: rgba(238, 91, 91, .08); border-color: rgba(238, 91, 91, .25);
}
.rg-primary {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; min-height: 49px; margin-top: 24px; padding: 12px 15px;
  color: #07140f; border: 1px solid #a2f7ce; border-radius: 10px;
  background: linear-gradient(105deg, #a0f4c8, #75dfb0);
  box-shadow: 0 6px 24px rgba(73, 209, 154, .11);
  font-size: 12px; font-weight: 800; transition: transform .2s, filter .2s;
}
.rg-primary:hover { transform: translateY(-1px); filter: brightness(1.06); }
.rg-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; }
.rg-divider { display: flex; align-items: center; gap: 13px; margin: 23px 0 18px; color: #64777e; font: 9px var(--rg-mono); }
.rg-divider::before, .rg-divider::after { content: ''; flex: 1; height: 1px; background: rgba(153, 185, 190, .13); }
.rg-security-note { display: flex; align-items: flex-start; gap: 10px; color: #81949a; font-size: 10px; line-height: 1.7; }
.rg-security-note svg { flex: 0 0 auto; color: var(--rg-green); margin-top: 1px; }
.rg-otp-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; }
.rg-otp {
  min-width: 0; width: 100%; height: 51px; padding: 0;
  text-align: center; color: var(--rg-white); font: 20px var(--rg-mono);
  outline: none; border: 1px solid rgba(153, 185, 190, .2);
  border-radius: 9px; background: rgba(5, 11, 15, .5);
}
.rg-otp:focus { border-color: rgba(142, 240, 192, .65); box-shadow: 0 0 0 3px rgba(142, 240, 192, .07); }
.rg-back {
  display: inline-flex; align-items: center; gap: 7px; margin-top: 17px;
  padding: 4px 0; color: #91a3a9; border: 0; background: transparent; font-size: 11px;
}
.rg-back:hover { color: var(--rg-green); }
.rg-demo-hint { margin-top: 12px; color: #71858b; font-size: 10px; line-height: 1.6; }
.rg-footer {
  position: absolute; right: clamp(20px, 5vw, 76px); bottom: 23px; left: clamp(20px, 5vw, 76px);
  display: flex; justify-content: space-between; gap: 12px;
  color: #586b71; font: 9px var(--rg-mono); letter-spacing: .04em;
}
.rg-footer strong { color: #8b9fa4; font-weight: 400; }
@keyframes rg-rotate { to { transform: rotate(360deg); } }
@keyframes rg-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@media (max-width: 850px) {
  .rg-layout { grid-template-columns: 1fr; gap: 30px; padding-top: 38px; padding-bottom: 82px; }
  .rg-hero { text-align: center; }
  .rg-kicker { justify-content: center; margin-bottom: 17px; }
  .rg-heading { font-size: clamp(43px, 9vw, 66px); }
  .rg-hero-copy { margin-left: auto; margin-right: auto; }
  .rg-radar-wrap { width: min(78vw, 330px); margin-top: 0; }
  .rg-stats { max-width: 500px; margin: 0 auto; text-align: left; }
  .rg-auth-card { width: min(100%, 480px); margin: 0 auto; }
  .rg-footer { position: relative; bottom: auto; left: auto; right: auto; padding: 18px 20px 24px; }
}
@media (max-width: 440px) {
  .rg-topbar { padding: 18px 17px; }
  .rg-brand-name { font-size: 12px; }
  .rg-brand-sub { font-size: 8px; }
  .rg-online { font-size: 8px; }
  .rg-layout { padding-left: 17px; padding-right: 17px; }
  .rg-heading { font-size: 43px; }
  .rg-radar-wrap { width: min(82vw, 285px); }
  .rg-stat { padding: 11px 8px; }
  .rg-stat-label { font-size: 8px; }
  .rg-stat-value { font-size: 16px; }
  .rg-auth-card { padding: 23px 19px; }
  .rg-footer { flex-direction: column; font-size: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .rg-root *, .rg-root *::before, .rg-root *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    scroll-behavior: auto !important; transition-duration: .01ms !important;
  }
}

/* Cinematic 3D command-deck upgrade */
.rg-root {
  background: radial-gradient(ellipse at 19% 48%, rgba(24,130,109,.13), transparent 36%), radial-gradient(ellipse at 83% 24%, rgba(68,118,164,.12), transparent 34%), #05090d;
}
.rg-atmosphere {
  background: radial-gradient(ellipse at 48% 45%, rgba(26,119,99,.24), transparent 36%), radial-gradient(ellipse at 78% 78%, rgba(42,91,145,.16), transparent 35%), linear-gradient(135deg,#081219 0%,#05090e 56%,#071019 100%);
}
.rg-grid {
  background-image: linear-gradient(rgba(112,231,203,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(112,231,203,.055) 1px,transparent 1px);
  background-size: 42px 42px; transform: perspective(800px) rotateX(58deg) scale(1.7); transform-origin: 50% 100%; opacity: .36;
  mask-image: linear-gradient(to bottom,transparent 5%,black 78%);
}
.rg-layout { width: min(1320px,100%); gap: clamp(34px,6vw,92px); }
.rg-hero { animation: rg-hero-arrive .9s cubic-bezier(.2,.75,.2,1) both; }
.rg-heading { text-shadow: 0 8px 45px rgba(0,0,0,.35); }
.rg-heading em {
  background: linear-gradient(100deg,#a8ffd1 0%,#63e8cf 48%,#8bd5ff 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 25px rgba(98,232,207,.16));
}
.rg-radar-wrap { perspective: 1000px; filter: drop-shadow(0 30px 35px rgba(0,0,0,.26)); transform-style: preserve-3d; }
.rg-radar {
  width: 73%; overflow: visible; transform: rotateX(17deg) rotateZ(-8deg) translateZ(0); transform-style: preserve-3d;
  border-color: rgba(121,255,211,.28);
  background: radial-gradient(circle at 50% 50%,rgba(29,116,94,.24),rgba(7,19,24,.38) 62%,rgba(4,10,16,.25) 70%);
  box-shadow: 0 0 0 12px rgba(83,226,187,.018),0 0 0 28px rgba(83,226,187,.012),inset 0 0 65px rgba(64,235,190,.09),0 0 70px rgba(36,224,177,.09);
  animation: rg-radar-hover 8s ease-in-out infinite;
}
.rg-radar::before,.rg-radar::after { content:'';position:absolute;inset:-8%;border:1px solid rgba(105,231,202,.16);border-radius:50%;transform:translateZ(-18px);pointer-events:none; }
.rg-radar::after { inset:-16%;border-color:rgba(105,231,202,.075);transform:translateZ(-34px); }
.rg-sweep { background: conic-gradient(from 0deg,transparent 0 66%,rgba(92,227,174,.025) 76%,rgba(92,227,174,.22) 94%,transparent 100%); }
.rg-radar-core {
  border-radius:25px;transform:translateZ(34px) rotateZ(8deg);background:linear-gradient(145deg,rgba(18,64,53,.96),rgba(7,24,27,.98));
  box-shadow:0 16px 35px rgba(0,0,0,.36),0 0 55px rgba(74,219,167,.19),inset 0 1px rgba(255,255,255,.16),inset 0 0 22px rgba(74,219,167,.12);
}
.rg-blip { box-shadow:0 0 0 5px rgba(142,240,192,.08),0 0 18px var(--rg-green); }
.rg-blip.one { animation:rg-blip-pulse 2.6s ease-in-out infinite; }
.rg-blip.two { animation:rg-blip-pulse 3.2s .7s ease-in-out infinite; }
.rg-blip.three { animation:rg-blip-pulse 2.8s 1.2s ease-in-out infinite; }
.rg-stat {
  position:relative;overflow:hidden;border-color:rgba(145,222,206,.15);
  background:linear-gradient(145deg,rgba(22,39,43,.64),rgba(8,15,21,.74));
  box-shadow:inset 0 1px rgba(255,255,255,.035),0 12px 25px rgba(0,0,0,.1);
  transition:transform .25s ease,border-color .25s ease,background .25s ease;
}
.rg-stat::after { content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 25%,rgba(142,240,192,.07),transparent 68%);transform:translateX(-120%);animation:rg-stat-shimmer 7s ease-in-out infinite; }
.rg-stat:hover { transform:translateY(-4px);border-color:rgba(142,240,192,.38); }
.rg-auth-card {
  overflow:hidden;border-color:rgba(142,240,192,.22);
  background:radial-gradient(ellipse at 100% 0%,rgba(61,166,139,.12),transparent 42%),linear-gradient(145deg,rgba(18,32,38,.94),rgba(7,14,20,.97));
  box-shadow:0 32px 100px rgba(0,0,0,.42),0 0 65px rgba(48,207,164,.045),inset 0 1px rgba(255,255,255,.055);
  backdrop-filter:blur(22px);transform:perspective(1200px) rotateY(-2deg) rotateX(1deg);
  transition:transform .45s cubic-bezier(.2,.75,.2,1),border-color .3s,box-shadow .3s;
  animation:rg-card-arrive 1s .12s cubic-bezier(.2,.75,.2,1) both;
}
.rg-auth-card:hover { transform:perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(-3px);border-color:rgba(142,240,192,.34);box-shadow:0 38px 110px rgba(0,0,0,.46),0 0 75px rgba(48,207,164,.07),inset 0 1px rgba(255,255,255,.06); }
.rg-auth-card::after { content:'';position:absolute;top:0;right:0;width:150px;height:150px;background:radial-gradient(circle at top right,rgba(142,240,192,.1),transparent 70%);pointer-events:none; }
.rg-primary { position:relative;overflow:hidden;background:linear-gradient(105deg,#a8ffd1,#6de4c2 55%,#9be7f5);box-shadow:0 8px 28px rgba(73,209,154,.18),inset 0 1px rgba(255,255,255,.55); }
.rg-primary::after { content:'';position:absolute;top:-30%;bottom:-30%;left:-45%;width:30%;transform:skewX(-20deg);background:rgba(255,255,255,.36);transition:left .55s ease; }
.rg-primary:hover::after { left:125%; }
.rg-footer { color:#637d83; }
@keyframes rg-radar-hover { 0%,100%{transform:rotateX(17deg) rotateZ(-8deg) translateY(0)}50%{transform:rotateX(21deg) rotateZ(-5deg) translateY(-7px)} }
@keyframes rg-blip-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 4px rgba(142,240,192,.07),0 0 14px var(--rg-green)}50%{opacity:.65;box-shadow:0 0 0 10px rgba(142,240,192,0),0 0 22px var(--rg-green)} }
@keyframes rg-stat-shimmer { 0%,72%,100%{transform:translateX(-120%)}84%{transform:translateX(120%)} }
@keyframes rg-hero-arrive { from{opacity:0;transform:translate3d(-22px,10px,0)}to{opacity:1;transform:translate3d(0,0,0)} }
@keyframes rg-card-arrive { from{opacity:0;transform:perspective(1200px) rotateY(-7deg) translate3d(20px,12px,0)}to{opacity:1;transform:perspective(1200px) rotateY(-2deg) translate3d(0,0,0)} }
@media(max-width:850px) { .rg-radar{transform:none;animation:none}.rg-auth-card,.rg-auth-card:hover{transform:none} }
@media(prefers-reduced-motion:reduce) { .rg-radar,.rg-blip,.rg-stat::after,.rg-hero,.rg-auth-card{animation:none!important} }


.rg-map-stage {
  position: relative;
  width: min(120%, 660px);
  aspect-ratio: 1.48;
  margin: 20px 0 4px -7%;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  perspective: 900px;
}
.rg-map-art {
  display: block;
  width: 112%;
  max-width: none;
  height: auto;
  object-fit: contain;
  transform: rotateX(3deg) translateY(-2px);
  filter: drop-shadow(0 24px 28px rgba(0,0,0,.3)) saturate(1.1);
  animation: rg-map-float 7s ease-in-out infinite;
}
.rg-map-scanline {
  position: absolute;
  z-index: 1;
  inset: 5% 0 10%;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(79,255,213,.055) 49%, transparent 52%);
  background-size: 100% 210%;
  mix-blend-mode: screen;
  animation: rg-map-scan 6s linear infinite;
}
.rg-map-caption {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 9%;
  right: 2%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 20px;
  color: #80a7aa;
  font: 9px var(--rg-mono);
  letter-spacing: .09em;
}
.rg-map-caption span { display:flex;align-items:center;gap:7px; }
.rg-map-caption i { width:5px;height:5px;border-radius:50%;background:var(--rg-green);box-shadow:0 0 10px var(--rg-green); }
@keyframes rg-map-float {
  0%,100% { transform: rotateX(3deg) translateY(0) scale(1); }
  50% { transform: rotateX(5deg) translateY(-8px) scale(1.012); }
}
@keyframes rg-map-scan { from { background-position: 0 -100%; } to { background-position: 0 200%; } }
@media(max-width:850px) {
  .rg-map-stage { width:100%;margin:8px 0 10px;aspect-ratio:1.45; }
  .rg-map-art { width:115%;animation:none; }
  .rg-map-caption { font-size:8px; }
}
@media(prefers-reduced-motion:reduce) { .rg-map-art,.rg-map-scanline { animation:none!important; } }

`

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [step, setStep] = useState<AuthStep>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState('')

  function showError(text: string) {
    setMessage(text)
    setMessageIsError(true)
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setMessageIsError(false)

    const cleanEmail = email.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showError('Enter a valid email address to continue.')
      return
    }

    if (password.trim().length < 6) {
      showError('Your password must contain at least 6 characters.')
      return
    }

    setVerifiedEmail(cleanEmail)
    setStep('otp')
    setOtp('')
    setMessage('Demo mode: enter the six-digit verification code shown below.')
    setMessageIsError(false)
  }

  function handleOtpChange(value: string) {
    setOtp(value.replace(/\D/g, '').slice(0, 6))
    if (messageIsError) {
      setMessage('')
      setMessageIsError(false)
    }
  }

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (otp.length !== 6) {
      showError('Enter all six digits of the verification code.')
      return
    }

    if (otp !== DEMO_OTP) {
      showError('That code is incorrect. Try the demo code 123456.')
      return
    }

    setMessage('')
    setMessageIsError(false)
    onComplete()
  }

  return (
    <main className="rg-root">
      <style>{styles}</style>
      <div className="rg-atmosphere" aria-hidden="true" />
      <div className="rg-grid" aria-hidden="true" />

      <header className="rg-topbar">
        <div className="rg-brand">
          <div className="rg-brand-icon"><ShieldCheck size={22} /></div>
          <div>
            <div className="rg-brand-name">RESCUEGRID</div>
            <div className="rg-brand-sub">EMERGENCY RESPONSE INTELLIGENCE</div>
          </div>
        </div>
        <div className="rg-online">
          <span className="rg-online-dot" />
          SYSTEM OPERATIONAL
        </div>
      </header>

      <div className="rg-layout">
        <section className="rg-hero">
          <div className="rg-kicker">
            <span className="rg-kicker-line" />
            MISSION CONTROL / FIELD SYSTEMS
          </div>

          <h1 className="rg-heading">
            When every route
            <br />
            <em>matters.</em>
          </h1>

          <p className="rg-hero-copy">
            Coordinate emergency resources, understand road conditions,
            and make smarter allocation decisions when every second counts.
          </p>

          <div className="rg-map-stage" aria-label="Illustrated 3D disaster response map with relief routes and emergency markers">
            <img className="rg-map-art" src="/rescuegrid-isometric-map.svg" alt="Isometric disaster-response terrain with glowing relief routes, shelter hubs, medical support, and a hazard zone" />
            <div className="rg-map-scanline" />
            <div className="rg-map-caption"><span><i /> LIVE ROUTE MODEL</span><span><i /> PRIORITY ZONES MAPPED</span></div>
          </div>

          <div className="rg-stats">
            <div className="rg-stat">
              <div className="rg-stat-label">RESPONSE MODE</div>
              <div className="rg-stat-value">Adaptive <small>●</small></div>
            </div>
            <div className="rg-stat">
              <div className="rg-stat-label">ROUTE ENGINE</div>
              <div className="rg-stat-value">Ready <small>↗</small></div>
            </div>
            <div className="rg-stat">
              <div className="rg-stat-label">FIELD STATUS</div>
              <div className="rg-stat-value">Online <small>●</small></div>
            </div>
          </div>
        </section>

        <section className="rg-auth-card" aria-labelledby="rg-auth-title">
          {step === 'login' ? (
            <>
              <div className="rg-auth-eyebrow">
                <Fingerprint size={15} />
                SECURE ACCESS / 01
              </div>
              <h2 className="rg-auth-title" id="rg-auth-title">Welcome, operator.</h2>
              <p className="rg-auth-subtitle">
                Sign in to access the RescueGrid emergency response command center.
              </p>

              <form onSubmit={handleLogin} noValidate>
                <label className="rg-field">
                  <span className="rg-field-label">Email address</span>
                  <span className="rg-input-wrap">
                    <Mail className="rg-input-icon" size={16} />
                    <input
                      className="rg-input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="operator@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </span>
                </label>

                <label className="rg-field">
                  <span className="rg-field-label">Password</span>
                  <span className="rg-input-wrap">
                    <LockKeyhole className="rg-input-icon" size={16} />
                    <input
                      className="rg-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      className="rg-eye"
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>

                {message && (
                  <div
                    className={`rg-auth-message${messageIsError ? ' error' : ''}`}
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </div>
                )}

                <button className="rg-primary" type="submit">
                  Continue securely <ArrowRight size={17} />
                </button>
              </form>

              <div className="rg-divider">SECURITY PROTOCOL</div>
              <div className="rg-security-note">
                <ShieldCheck size={17} />
                <span>
                  A one-time verification code is required before entering
                  the command center.
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="rg-auth-eyebrow">
                <CheckCircle2 size={15} />
                IDENTITY CHECK / 02
              </div>
              <h2 className="rg-auth-title" id="rg-auth-title">Verify your access.</h2>
              <p className="rg-auth-subtitle">
                Enter the six-digit code to continue. Verification is being
                simulated for this demo.
              </p>

              <div className="rg-security-note">
                <Mail size={17} />
                <span>Verification address: <strong>{verifiedEmail}</strong></span>
              </div>

              <form onSubmit={handleVerify} noValidate>
                <label className="rg-field">
                  <span className="rg-field-label">Verification code</span>
                  <input
                    className="rg-input"
                    style={{ paddingLeft: 14, fontFamily: 'DM Mono, monospace', letterSpacing: '.16em' }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(event) => handleOtpChange(event.target.value)}
                    required
                  />
                </label>

                {message && (
                  <div
                    className={`rg-auth-message${messageIsError ? ' error' : ''}`}
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </div>
                )}

                <button className="rg-primary" type="submit">
                  Verify and enter <ArrowUpRight size={17} />
                </button>
              </form>

              <div className="rg-auth-message">
                <Zap size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                Demo verification code: <strong>{DEMO_OTP}</strong>
              </div>

              <button
                className="rg-back"
                type="button"
                onClick={() => {
                  setStep('login')
                  setOtp('')
                  setMessage('')
                  setMessageIsError(false)
                }}
              >
                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                Back to sign in
              </button>
            </>
          )}
        </section>
      </div>

      <footer className="rg-footer">
        <span><strong>SAGARIKA DISTRICT</strong> · COASTAL RESPONSE SIMULATION</span>
        <span><Waves size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> DEMO ENVIRONMENT · DATA IS SIMULATED</span>
      </footer>
    </main>
  )
}
export default IntroScreen