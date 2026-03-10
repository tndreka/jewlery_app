import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-[32px] font-light tracking-[0.05em]">Something went wrong</h1>
          <p className="mt-3 text-[12px] text-secondary font-light">An unexpected error occurred.</p>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false })}
            className="mt-8 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
          >
            Go Home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
