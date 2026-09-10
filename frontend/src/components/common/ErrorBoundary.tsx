import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '3rem 1.5rem'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-subtle)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>

          <p
            style={{
              maxWidth: '540px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}
          >
            {this.state.error?.message ||
              'A client-side rendering issue occurred. This often happens if the backend API URL is connecting or warming up.'}
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <RefreshCw size={16} />
            Reload CineScope
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
