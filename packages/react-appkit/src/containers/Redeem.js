import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';

import { useInvitationRedeemer } from '@dxos/react-client';

export default function RedeemDialog ({ onClose, ...props }) {
  const onDone = () => {
    setStep(0);
    setInvitationCode('');
    setPinCode('');
    onClose();
  };
  const [redeemCode, setPin] = useInvitationRedeemer({ onDone, onError: (e) => { throw e; } });
  const [step, setStep] = useState(0);
  const [invitationCode, setInvitationCode] = useState('');
  const [pinCode, setPinCode] = useState('');

  const handleEnterInvitationCode = async () => {
    redeemCode(invitationCode);
    setStep(1);
  };

  const handleEnterPinCode = async () => {
    setPin(pinCode);
  };

  return (
    <Dialog open onClose={onDone} {...props}>
      <DialogTitle>Redeem Invitation Code</DialogTitle>
      {step === 0 && (
        <>
          <DialogContent>
            <Typography variant='body1' gutterBottom>
                Paste your Invitation Code Below
            </Typography>
            <Divider />
            <TextareaAutosize
              autoFocus
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value)}
              rowsMin={3}
              style={{ minWidth: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button color='primary' onClick={handleEnterInvitationCode}>Send</Button>
          </DialogActions>
        </>
      )}
      {step === 1 && setPin && (
        <>
          <DialogContent>
            <Typography variant='body1' gutterBottom>
                Enter the PIN number
            </Typography>
            <TextField
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
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
            <Button autoFocus color='primary' onClick={handleEnterPinCode}>Send</Button>
          </DialogActions>
        </>
      )}
      {step === 1 && !setPin && (
        <DialogContent>
          <Typography variant='body1' gutterBottom>
              Finishing process. Hold on.
          </Typography>
        </DialogContent>
      )}
    </Dialog>
  );
}
