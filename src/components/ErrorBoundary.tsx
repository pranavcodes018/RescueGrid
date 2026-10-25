import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RescueGrid render error', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-canvas flex min-h-[100svh] items-center justify-center p-4">
          <div className="panel max-w-md p-5 text-center">
            <TriangleAlert size={22} aria-hidden className="mx-auto text-warn" />
            <h1 className="mt-2 text-[15px] font-medium text-mist-50">The simulation view failed to render</h1>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mist-400">
              This is a local prototype; no data has been sent anywhere. You can try rendering the board
              again or reload the page to restore the baseline scenario.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="rounded-md border border-line bg-white/[0.04] px-3 py-1.5 text-[11px] text-mist-200 hover:bg-white/[0.08]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md border border-signal/50 bg-signal px-3 py-1.5 text-[11px] font-semibold text-[#03211d] hover:bg-signal-bright"
              >
                Reload simulation
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
