import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Unhandled UI error:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div
                role="alert"
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: '#f8fafc'
                }}
            >
                <div
                    style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '32px',
                        maxWidth: '420px',
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0f172a' }}>
                        Something went wrong
                    </h2>
                    <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                        The page hit an unexpected error. Try again, or reload the page.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => this.setState({ hasError: false })}
                            style={{
                                padding: '9px 16px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Try again
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '9px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#4f46e5',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}