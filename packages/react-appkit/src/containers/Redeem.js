//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';

import { useInvitationRedeemer } from '@dxos/react-client';

export default function RedeemDialog ({ onClose, ...props }) {
  const onDone = () => {
    setStep(0);
    setInvitationCode('');
    setPinCode('');
    onClose();
  };
  const [redeemCode, setPin] = useInvitationRedeemer({ onDone, onError: (ex) => { throw ex; } });
  const [step, setStep] = useState(0); // TODO(burdon): Const.
  const [invitationCode, setInvitationCode] = useState('');
  const [pinCode, setPinCode] = useState('');

  const handleEnterInvitationCode = async () => {
    redeemCode(invitationCode);
    setStep(1);
  };

  const handleEnterPinCode = async () => {
    setPin(pinCode);
  };

  // TODO(burdon): Standardize dialogs.
  // TODO(burdon): Hit enter to proceed.
  return (
    <Dialog open onClose={onDone} {...props}>
      <DialogTitle>Redeem Invitation</DialogTitle>
      {step === 0 && (
        <>
          <DialogContent>
            <Typography variant='body1' gutterBottom>
              Paste the invitation code below.
            </Typography>
            <Divider />
            <TextareaAutosize
              autoFocus
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value)}
              rowsMin={6}
              style={{ minWidth: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus color='secondary' onClick={onDone}>Cancel</Button>
            <Button color='primary' onClick={handleEnterInvitationCode}>Submit</Button>
          </DialogActions>
        </>
      )}
      {step === 1 && setPin && (
        <>
          <DialogContent>
            <Typography variant='body1' gutterBottom>
              Enter the PIN number.
            </Typography>
            <TextField
              value={pinCode}
              onChange={(event) => setPinCode(event.target.value)}
              variant='outlined'
              margin='normal'
              required
              fullWidth
              label='PIN Code'
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button autoFocus color='secondary' onClick={onDone}>Cancel</Button>
            <Button autoFocus color='primary' onClick={handleEnterPinCode}>Submit</Button>
          </DialogActions>
        </>
      )}
      {step === 1 && !setPin && (
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            Processing invitation...
          </Typography>
        </DialogContent>
      )}
    </Dialog>
  );
}
