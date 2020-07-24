//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';

import React, { useState, useRef } from 'react';

import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Clear';
import RestoreIcon from '@material-ui/icons/RestoreFromTrash';
import SettingsIcon from '@material-ui/icons/MoreVert';

import { keyToString } from '@dxos/crypto';

import { useAssets } from './util';

import NewViewCreationMenu from './NewViewCreationMenu';
import PartySharingDialog from './PartySharingDialog';
import PartySettingsDialog from './PartySettingsDialog';
import PartyMemberList from './PartyMemberList';

import PadIcon from './PadIcon';

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    minHeight: 326
  },

  newCard: {
    padding: theme.spacing(5),
    textAlign: 'center'
  },

  unsubscribed: {
    '& img': {
      '-webkit-filter': 'grayscale(100%)',
      opacity: 0.7
    }
  },

  headerRoot: {
    height: 62 // Prevent collapse if menu icon isn't present (if not subscribed).
  },
  headerContent: {
    overflow: 'hidden'
  },
  headerAction: {
    margin: 0
  },

  actions: {
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },

  listContainer: ({ rows }) => ({
    height: rows * 36,
    marginBottom: theme.spacing(1),
    overflowY: 'scroll'
  }),

  title: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  addButton: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    marginTop: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing(4)
  },
  addIcon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: theme.palette.grey[300]
  },
  addSubtitle: {
    color: theme.palette.grey[300],
    marginTop: theme.spacing(3)
  }
}));

// TODO(burdon): Rename onCreateParty
// TODO(burdon): Extract client, router and dialogs and inject actions.
const PartyCard = ({ party, client, router, pads, viewModel, onNewParty, onNewItemRequested }) => {
  const classes = useStyles({ rows: 3 });
  const assets = useAssets();
  const [newViewCreationMenuOpen, setNewViewCreationMenuOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  // TODO(burdon): Where to store this information?
  const [showDeleted, setShowDeleted] = useState(false);
  const createViewAnchor = useRef();

  const topic = party ? keyToString(party.publicKey) : '';

  const handleNewViewSelected = (type) => {
    setNewViewCreationMenuOpen(false);
    onNewItemRequested({ type });
  };

  const handleSelect = (viewId) => {
    router.push({ topic, item: viewId });
  };

  const handleSubscribe = async () => {
    await client.partyManager.subscribe(party.publicKey);
  };

  const handleUnsubscribe = async () => {
    await client.partyManager.unsubscribe(party.publicKey);
  };

  if (onNewParty) {
    return (
      <Card className={clsx(classes.card, classes.newCard)}>
        <IconButton className={classes.addButton} onClick={onNewParty}>
          <AddIcon className={classes.addIcon} />
        </IconButton>
        <Typography className={classes.addSubtitle} variant='h5'>New Party</Typography>
      </Card>
    );
  }

  return (
    <>
      <Card className={clsx(classes.card, !party.subscribed && classes.unsubscribed)}>
        <CardMedia
          component='img'
          height={100}
          image={assets.getThumbnail(topic)}
        />

        <CardHeader
          classes={{
            root: classes.headerRoot,
            content: classes.headerContent,
            action: classes.headerAction
          }}
          title={
            <Typography
              classes={{ root: classes.title }}
              component='h2'
              variant='h5'
            >
              {party.displayName}
            </Typography>
          }
          action={party.subscribed && (
            <IconButton
              size='small'
              edge='end'
              aria-label='settings'
              onClick={() => setSettingsDialogOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          )}
        />

        <div className={classes.listContainer}>
          <List dense disablePadding>
            {viewModel.getAllViews().map(item => (
              <ListItem
                key={item.viewId}
                button
                disabled={!party.subscribed}
                onClick={() => handleSelect(item.viewId)}
              >
                <ListItemIcon>
                  <PadIcon type={item.type} />
                </ListItemIcon>
                <ListItemText>
                  {item.displayName}
                </ListItemText>
                {party.subscribed && (
                  <ListItemSecondaryAction>
                    <IconButton size='small' edge='end' aria-label='delete' onClick={() => viewModel.deleteView(item.viewId)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}

            {party.subscribed && showDeleted && viewModel.getAllDeletedViews().map(item => (
              <ListItem key={item.viewId} disabled>
                <ListItemIcon>
                  <PadIcon type={item.type} />
                </ListItemIcon>
                <ListItemText>
                  {item.displayName}
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton edge='end' aria-label='restore' onClick={() => viewModel.restoreView(item.viewId)}>
                    <RestoreIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>

        <CardActions className={classes.actions}>
          {party.subscribed && (
            <>
              <PartyMemberList party={party} onShare={() => setShareDialogOpen(true)} />
              <IconButton
                ref={createViewAnchor}
                size='small'
                edge='end'
                aria-label='add view'
                onClick={() => setNewViewCreationMenuOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </>
          )}

          {!party.subscribed && (
            <Button
              size='small'
              color='secondary'
              onClick={handleSubscribe}
            >
              Subscribe
            </Button>
          )}
        </CardActions>
      </Card>

      {/* TODO(burdon): Move outside: don't create this FOR EACH party. */}
      <NewViewCreationMenu
        anchorEl={createViewAnchor.current}
        open={newViewCreationMenuOpen}
        onSelect={handleNewViewSelected}
        onClose={() => setNewViewCreationMenuOpen(false)}
        pads={pads}
      />

      {/* TODO(burdon): Move outside: don't create this FOR EACH party. */}
      <PartySharingDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        client={client}
        party={party}
        router={router}
      />

      {party.subscribed && (
        <PartySettingsDialog
          party={party}
          client={client}
          open={settingsDialogOpen}
          properties={{
            showDeleted,
            subscribed: party.subscribed
          }}
          onClose={({ showDeleted, subscribed }) => {
            setShowDeleted(showDeleted);
            if (subscribed && !party.subscribed) {
              handleSubscribe();
            }
            if (!subscribed && party.subscribed) {
              handleUnsubscribe();
            }
            setSettingsDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default PartyCard;
