//
// Copyright 2020 DXOS.org
//

import { fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';

import RegistrationDialog from '../src/components/RegistrationDialog';
import { renderWithTheme } from './test-utils';

describe('RegistrationDialog', () => {
  let finished;

  const defaultProps = {
    onFinishCreate: () => {
      finished = true;
    },
    onFinishRestore: () => {
      finished = true;
    },
    keyringDecrypter: () => console.warn('Not implemented in this test.')
  };

  const createInputValue = (val) => {
    return {
      target: {
        value: val
      }
    };
  };

  beforeEach(() => {
    finished = false;
    renderWithTheme(<RegistrationDialog {...defaultProps} />);
  });

  describe('User Profile stage', () => {
    test('Clicking "Create Wallet" leads to Create Identity stage', async () => {
      fireEvent.click(screen.getByText('Create Wallet'));
      expect(() => screen.getByText('Create your Identity')).not.toThrow();
    });

    test('Clicking "Recover Wallet" leads to Restoring Wallet stage', async () => {
      fireEvent.click(screen.getByText('Recover Wallet'));
      expect(() => screen.getByText('Restoring your Wallet')).not.toThrow();
    });
  });

  describe('Restore Wallet stage', () => {
    beforeEach(() => fireEvent.click(screen.getByText('Recover Wallet')));

    test('Clicking "Back" leads back to User Profile stage', async () => {
      fireEvent.click(screen.getByText('Back'));
      expect(() => screen.getByText('User Profile')).not.toThrow();
    });

    test('12-words seed phrase is valid', async () => {
      fireEvent.change(screen.getByRole('textbox'), createInputValue('a bb c ddd e ff g hh iii j kk lll'));
      fireEvent.click(screen.getByText('Restore'));
      await waitFor(() => finished === true, { timeout: 100 });
      expect(finished).toEqual(true);
    });

    test('Less than 12-words seed phrase is invalid', async () => {
      fireEvent.change(screen.getByRole('textbox'), createInputValue('a bb c ddd e ff g hh iii j kk'));
      fireEvent.click(screen.getByText('Restore'));
      expect(finished).toEqual(false);
    });

    test('More than 12-words seed phrase is invalid', async () => {
      fireEvent.change(screen.getByRole('textbox'), createInputValue('a bb c ddd e ff g hh iii j kk lll m'));
      fireEvent.click(screen.getByText('Restore'));
      expect(finished).toEqual(false);
    });

    // test('Seed phrase containing non-letter characters is invalid', async () => {
    //   fireEvent.change(screen.getByRole('textbox'), createInputValue('a bb c dd5 e ff g hh i@i j kk lll'));
    //   fireEvent.click(screen.getByText('Restore'));
    //   expect(finished).toEqual(false);
    // });
  });

  describe('Create Identity stage', () => {
    beforeEach(() => fireEvent.click(screen.getByText('Create Wallet')));

    test('Clicking "Back" leads back to User Profile stage', async () => {
      fireEvent.click(screen.getByText('Back'));
      expect(() => screen.getByText('User Profile')).not.toThrow();
    });

    test('Clicking "Next" when Username input is empty does nothing', async () => {
      fireEvent.click(screen.getByText('Next'));
      expect(() => screen.getByText('Create your Identity')).not.toThrow();
    });

    test('Clicking "Next" when Username input is not empty leads to Seed Phrase stage', async () => {
      fireEvent.change(screen.getByRole('textbox'), createInputValue('User'));
      fireEvent.click(screen.getByText('Next'));
      expect(() => screen.getByText('Create your Identity')).toThrow();
      expect(() => screen.getByText('Seed Phrase')).not.toThrow();
    });
  });

  describe('Seed Phrase stage', () => {
    beforeEach(() => {
      fireEvent.click(screen.getByText('Create Wallet'));
      fireEvent.change(screen.getByRole('textbox'), createInputValue('Tester'));
      fireEvent.click(screen.getByText('Next'));
    });

    test('12 secret words are displayed', async () => {
      const chips = screen.getAllByTestId('chip');
      expect(chips.length).toEqual(12);
    });

    test('Clicking "Back" leads to Create Identitity stage', async () => {
      fireEvent.click(screen.getByText('Back'));
      expect(() => screen.getByText('Seed Phrase')).toThrow();
      expect(() => screen.getByText('Create your Identity')).not.toThrow();
    });

    // test('Clicking "Download" fires seed phrases download', async () => {
    // TODO
    // });

    test.skip('Clicking "Next" leads to Verify Seed Phrase stage', async () => null);
  });
});
