"use client"

import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="bg-muted flex size-20 items-center justify-center rounded-full">
            <AlertCircle className="text-muted-foreground size-10" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleRetry} className="mt-4">
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 