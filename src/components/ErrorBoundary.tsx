import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);

    // Show a toast notification
    toast({
      variant: "destructive",
      title: "An unexpected error occurred",
      description: error.message
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or default error message
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p>We're sorry for the inconvenience. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}