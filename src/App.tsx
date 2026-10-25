import { useEffect, useRef, useState } from 'react'
import { LandingPage } from './components/LandingPage';

import { ErrorBoundary } from './components/ErrorBoundary'
import IntroScreen from './components/IntroScreen'

import { BottomStrip } from './components/layout/BottomStrip'
import { MobileNav } from './components/layout/MobileNav'
import { MobileSheet } from './components/layout/MobileSheet'
import { RightPanel } from './components/layout/RightPanel'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'

import { AllocationLab } from './screens/AllocationLab'
import { Overview } from './screens/Overview'
import { Reports } from './screens/Reports'
import { RoadNetwork } from './screens/RoadNetwork'
import { Scenarios } from './screens/Scenarios'

import {
  SimulationProvider,
  useSimulation,
} from './state/SimulationContext'

import type { ScreenId } from './types'

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  overview: Overview,
  lab: AllocationLab,
  network: RoadNetwork,
  scenarios: Scenarios,
  reports: Reports,
}



function AppShell() {
  const { state } = useSimulation()

  const [stage, setStage] = useState<'landing' | 'intro' | 'dashboard'>('landing')
  const mainRef = useRef<HTMLElement | null>(null)
  const Screen = SCREENS[state.screen]

  useEffect(() => {
    mainRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [state.screen, stage])

  if (stage === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setStage('intro')}
      />
    )
  }

  if (stage === 'intro') {
    return (
      <IntroScreen
        onComplete={() => setStage('dashboard')}
      />
    )
  }

  return (
    <div className="app-root app-canvas min-h-[100svh] text-mist-100 lg:h-[100svh] lg:overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:border focus:border-signal/50 focus:bg-night-800 focus:px-3 focus:py-2 focus:text-[12px] focus:text-mist-50"
      >
        Skip to main content
      </a>

      <TopBar />

      <div className="app-shell flex min-h-[calc(100svh-78px)] lg:h-[calc(100svh-82px)] lg:min-h-0">
        <Sidebar />

        <div className="app-body flex min-w-0 flex-1 flex-col">
          <div className="app-main flex min-h-0 flex-1">
            <main
              ref={mainRef}
              id="main-content"
              tabIndex={-1}
              className="screen-scroll min-w-0 flex-1 overflow-y-auto overscroll-contain pb-[188px] outline-none lg:pb-0"
            >
              <Screen />
            </main>

            <RightPanel />
          </div>

          <BottomStrip />
        </div>
      </div>

      <MobileNav />
      <MobileSheet />
    </div>
  )
}



export default function App() {
  return (
    <SimulationProvider>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </SimulationProvider>
  )
}
