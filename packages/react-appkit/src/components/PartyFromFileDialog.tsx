//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import React, { useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import PeopleIcon from '@material-ui/icons/People';

import DialogHeading from './DialogHeading';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: '400px'
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  dropZone: {
    marginTop: 24,
    padding: 24,
    border: '1px dashed #D8E0E3',
    borderRadius: 8,
    textAlign: 'center'
  },
  uploadInput: {
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: -1
  },
  browseButton: {
    cursor: 'pointer',
    marginTop: theme.spacing(1)
  },
  fileItem: {
    display: 'flex'
  }
}));

const PartyFromFileDialog = ({
  open,
  onClose,
  onImport
}: {
  open: boolean,
  onClose: () => void,
  onImport: (content: ArrayBuffer | string | null) => void
}) => {
  const classes = useStyles();
  const [files, setFiles] = useState<File[]>([]);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState(undefined);

  const addFiles = (filesList: FileList | null) => {
    setError(undefined);
    const selectedFiles = Array.from(filesList ?? []);
    setFiles(selectedFiles.splice(0, 1));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    assert(event.dataTransfer);
    addFiles(event.dataTransfer.files);
  };

  const onFilesSelect = (event: React.SyntheticEvent) => {
    const target = (event.target as HTMLInputElement);
    addFiles(target.files);
    target.value = '';
  };

  const handleClose = () => {
    setFiles([]);
    setInProgress(false);
    setError(undefined);
    onClose();
  };

  const handleImport = () => {
    setInProgress(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const content = reader.result;
        await onImport(content);
        handleClose();
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setInProgress(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog classes={{ paper: classes.root }} maxWidth='lg' open={open} onClose={handleClose}>

      <DialogHeading title='Import Party' icon={PeopleIcon}/>

      <DialogContent
        onDrop={onDrop}
        onDragOver={event => event.preventDefault()}
      >
        <Typography variant='body1'>A Party can be exported and imported from a file.</Typography>
        <div className={classes.dropZone}>
          <Typography variant='body1'>Drag & Drop, or</Typography>
          <input
            multiple={false}
            id='file-input'
            type='file'
            name='file'
            accept='.json,.txt'
            onChange={onFilesSelect}
            className={classes.uploadInput}
          />
          <Button className={classes.browseButton} variant='text' size='small'>
            <label htmlFor='file-input'>Click to browse</label>
          </Button>
        </div>

        <ul>
          {files && files.map(f => (
            <li key={f.name} className={classes.fileItem}>
              <p>{f.name}</p>
              <IconButton aria-label='remove' color='secondary' onClick={() => setFiles([])}>
                <CloseIcon />
              </IconButton>
            </li>
          ))}
        </ul>

        {!!error && <Typography variant='body2' color='error'>Import unsuccessful</Typography>}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!files || files.length !== 1 || inProgress}
          variant='contained'
          color='primary'
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartyFromFileDialog;
