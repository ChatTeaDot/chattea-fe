import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: () => ReactNode;
};

type ErrorBoundaryState = { error: unknown };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: undefined };

  static getDerivedStateFromError = (error: unknown): ErrorBoundaryState => ({ error });

  override render() {
    if (this.state.error !== undefined) {
      return this.props.fallback();
    }
    return this.props.children;
  }
}
