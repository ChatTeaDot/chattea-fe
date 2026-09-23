import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
};

type ErrorBoundaryState = { error: unknown };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: undefined };

  static getDerivedStateFromError = (error: unknown): ErrorBoundaryState => ({ error });

  reset = () => {
    this.setState({ error: undefined });
  };

  override render() {
    if (this.state.error !== undefined) {
      return this.props.fallback(this.reset);
    }
    return this.props.children;
  }
}
