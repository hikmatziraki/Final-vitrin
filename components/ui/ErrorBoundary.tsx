import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">خطایی رخ داد</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-xs">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl text-sm font-semibold"
          >
            تلاش مجدد
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
