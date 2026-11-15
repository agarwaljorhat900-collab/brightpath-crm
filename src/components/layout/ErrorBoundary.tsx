import React from 'react';

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Unhandled UI error:', error, info);
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div role="alert" style={{ maxWidth: 420, margin: '15vh auto', padding: 24, textAlign: 'center', fontFamily: 'system-ui' }}>
                <h2>Something went wrong</h2>
                <p style={{ color: '#64748b' }}>
                    Check your internet connection and try again. Your saved data is safe.
                </p>
                <button type="button" className="btn-primary" onClick={() => this.setState({ hasError: false, message: '' })}>
                    Try again
                </button>{' '}
                <button type="button" onClick={() => window.location.reload()}>
                    Reload page
                </button>
            </div>
        );
    }
}