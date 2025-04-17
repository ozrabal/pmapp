import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircleIcon } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to an error reporting service
    console.error("Dashboard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 rounded-lg border border-destructive/20">
          <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coś poszło nie tak</h2>
          <p className="text-muted-foreground mb-4 text-center">
            Wystąpił błąd podczas ładowania widoku. Spróbuj odświeżyć stronę.
          </p>
          <p className="text-xs text-muted-foreground bg-background/80 p-2 rounded max-w-full overflow-auto">
            {this.state.error?.message || "Nieznany błąd"}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Odśwież stronę
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}