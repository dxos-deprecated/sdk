
import { fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import AuthenticatorDialog from '../components/AuthenticatorDialog';
import { renderWithTheme } from './test-utils';

describe('AuthenticatorDialog', () => {
  const consoleOutput = [];
  const mockedLog = output => consoleOutput.push(output);
  const originalLog = console.log;

  beforeEach(() => (console.log = mockedLog));
  afterEach(() => (console.log = originalLog));

  const defaultProps = {
    error: null,
    onSubmit: () => null,
    onCancel: () => null
  };

  test('Passcode input visible and accept values when unknown user', async () => {
    const props = {
      ...defaultProps,
      isOfflineKeyInvitation: false
    };

    renderWithTheme(<AuthenticatorDialog {...props} />);

    expect(() => screen.getByRole('textbox')).not.toThrow();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1111' } });
    await waitFor(() => null, { timeout: 100 });

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0]).toEqual('Passcode: 1111 [1]');
  });

  test('Passcode input invisible when known user', async () => {
    const props = {
      ...defaultProps,
      isOfflineKeyInvitation: true
    };

    renderWithTheme(<AuthenticatorDialog {...props} />);

    expect(() => screen.getByRole('textbox')).toThrow();
  });

  test('Cancel click is handled', async () => {
    // let cancelled = false;
    // const props = {
    //   ...defaultProps,
    //   onCancel: () => { cancelled = true; }
    // };

    // renderWithTheme(<AuthenticatorDialog {...props} />);
  });
});
