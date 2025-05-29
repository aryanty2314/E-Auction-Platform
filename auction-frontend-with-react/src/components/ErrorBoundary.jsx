import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    // Example: logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-gray-800 p-4">
          <div className="text-center p-8 bg-white shadow-xl rounded-lg border border-red-200 max-w-lg w-full">
            <div className="text-6xl text-red-500 mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Oops! Something Went Wrong</h1>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              We're sorry, but an unexpected error occurred. Our team has been notified.
              Please try reloading the page. If the problem persists, feel free to contact support.
            </p>
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-md hover:shadow-lg"
              onClick={() => {
                // Attempt to clear error for re-render of children, or reload
                // For a critical error, reload is often safer.
                this.setState({ hasError: false, error: null, errorInfo: null });
                // window.location.reload(); 
              }}
            >
              Try Again or Reload Page
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-8 text-left bg-gray-100 p-4 rounded-md border border-gray-300">
                <summary className="cursor-pointer text-sm text-gray-600 font-semibold hover:text-gray-800">
                  Technical Error Details (Development Mode)
                </summary>
                <div className="mt-3">
                  <strong className="text-red-700 block mb-1">Error:</strong>
                  <pre className="text-xs text-red-600 p-3 bg-red-50 rounded overflow-auto max-h-40 border border-red-200">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                </div>
                <div className="mt-3">
                  <strong className="text-red-700 block mb-1">Component Stack:</strong>
                  <pre className="text-xs text-red-600 p-3 bg-red-50 rounded overflow-auto max-h-60 border border-red-200">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;