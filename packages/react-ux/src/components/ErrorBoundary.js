//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';
import ErrorView from './ErrorView';

/**
 * Root-level error boundary.
 * https://reactjs.org/docs/error-boundaries.html
 *
 * NOTE: Must currently be a Component.
 * https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes
 */
class ErrorBoundary extends Component {
  state = {
    error: null
  };

  static getDerivedStateFromError (error) {
    return { error };
  }

  componentDidCatch (error, errorInfo) {
    const { onError } = this.props;

    // TODO(burdon): Show error indicator.
    // TODO(burdon): Logging service; output error file to storage?
    onError(error, errorInfo);
  }

  render () {
    const { children, onRestart, onReset } = this.props;
    const { error } = this.state;

    if (error) {
      return <ErrorView onRestart={onRestart} onReset={onReset} error={error} />;
    }

    return children;
  }
}

ErrorBoundary.defaultProps = {
  onError: console.warn,
  onRestart: () => { window.location.href = '/'; },
  onReset: undefined
};

export default ErrorBoundary;
