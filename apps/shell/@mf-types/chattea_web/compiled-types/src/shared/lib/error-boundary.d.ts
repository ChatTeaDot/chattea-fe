import { Component, type ReactNode } from "react";
type ErrorBoundaryProps = {
    children: ReactNode;
    fallback: (reset: () => void) => ReactNode;
};
type ErrorBoundaryState = {
    error: unknown;
};
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError: (error: unknown) => ErrorBoundaryState;
    reset: () => void;
    render(): ReactNode;
}
export {};
