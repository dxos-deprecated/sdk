//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import assert from 'assert';

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
import BuildIcon from '@material-ui/icons/Build';

import { keyToString } from '@dxos/crypto';

import { useAssets } from './util';

import NewViewCreationMenu from './NewViewCreationMenu';
import PadIcon from './PadIcon';
import PartySharingDialog from './PartySharingDialog';
import PartySettingsDialog from './PartySettingsDialog';
import PartyMemberList from './PartyMemberList';

const useStyles = makeStyles(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    maxHeight: 320
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

  listContainer: {
    height: 180, // 5 * 36
    marginBottom: theme.spacing(1),
    overflowY: 'scroll'
  },
  list: {
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2)
  },
  titleRoot: ({ variant }) => {
    return {
      ...theme.typography[variant],
      letterSpacing: 0,
      color: 'inherit'
    };
  },

  titleReadonly: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }

}));

const PartyCard = ({ party, viewModel, createView, client, router, pads }) => {
  const classes = useStyles();
  const assets = useAssets();
  const [newViewCreationMenuOpen, setNewViewCreationMenuOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deletedItemsVisible, setDeletedItemsVisible] = useState(false);
  const createViewAnchor = useRef();

  const topic = keyToString(party.publicKey);

  const handleSelect = (viewId) => {
    router.push({ topic, item: viewId });
  };

  const handleCreate = (type) => {
    assert(type);
    setNewViewCreationMenuOpen(false);
    const viewId = createView(type);
    handleSelect(viewId);
  };

  const handleSubscribe = async () => {
    await client.partyManager.subscribe(party.publicKey);
  };

  const handleUnsubscribe = async () => {
    await client.partyManager.unsubscribe(party.publicKey);
  };

  return (
    <>
      <Card className={clsx(classes.card, !party.subscribed && classes.unsubscribed)}>
        <CardHeader
          classes={{
            root: classes.headerRoot,
            content: classes.headerContent,
            action: classes.headerAction
          }}
          title={
            <Typography
              classes={{ root: clsx(classes.titleRoot, classes.titleReadonly) }}
              variant='body1'
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
              <BuildIcon />
            </IconButton>
          )}
        />

        <CardMedia
          component='img'
          height={100}
          image={assets.getThumbnail(topic)}
        />

        <div className={classes.listContainer}>
          <List className={classes.list} dense disablePadding>
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

            {party.subscribed && deletedItemsVisible && viewModel.getAllDeletedViews().map(item => (
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

      <NewViewCreationMenu
        anchorEl={createViewAnchor.current}
        open={newViewCreationMenuOpen}
        onSelect={handleCreate}
        onClose={() => setNewViewCreationMenuOpen(false)}
        pads={pads}
      />

      {/* TODO(burdon): Move to Home (i.e., single instance. */}
      <PartySharingDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        party={party}
        client={client}
        router={router}
      />
      <PartySettingsDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        party={party}
        client={client}
        deletedItemsVisible={deletedItemsVisible}
        onVisibilityToggle={() => setDeletedItemsVisible(prev => !prev)}
        onUnsubscribe={handleUnsubscribe}
      />
    </>
  );
};

export default PartyCard;
