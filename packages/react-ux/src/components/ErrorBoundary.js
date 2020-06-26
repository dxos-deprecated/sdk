//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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
      return (
        <Dialog
          open
          onClose={onRestart}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            Runtime Error
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              {String(error)}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onRestart} variant='contained' color='primary'>
              Restart
            </Button>
            {/* TODO(burdon): Add "Are you sure?" dialog. */}
            {onReset && (
              <Button onClick={onReset} variant='contained' color='secondary'>
                Reset
              </Button>
            )}
          </DialogActions>
        </Dialog>
      );
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
