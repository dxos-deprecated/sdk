//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import React, { useState, useRef, useEffect } from 'react';

import { Button, ListItemSecondaryAction, SvgIconTypeMap, Theme } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/MoreVert';
import RestoreIcon from '@material-ui/icons/RestoreFromTrash';
import { makeStyles } from '@material-ui/styles';

import { keyToString } from '@dxos/crypto';
import { Party } from '@dxos/echo-db';

import NewItemCreationMenu from './NewItemCreationMenu';
import PadIcon from './PadIcon';
import PartyMemberList from './PartyMemberList';
import PartySettingsDialog from './PartySettingsDialog';
import PartySharingDialog from './PartySharingDialog';
import { useAssets } from './util';

const useStyles = makeStyles((theme: Theme) => ({
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

  listContainer: ({ rows }: { rows: number }) => ({
    height: rows * 36,
    marginBottom: theme.spacing(1),
    overflowY: 'scroll'
  }),

  listItemText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },

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
const PartyCard = ({
  party,
  router,
  pads,
  items,
  onNewItemRequested,
  exportInProgress = false,
  onNewParty = undefined,
  onExportToFile = undefined,
  onExportToIpfs = undefined
}: {
  party: Party,
  router: Record<string, any>,
  pads: {
    type: string;
    displayName: string;
    description: string;
    icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>;
  }[],
  items: Record<string, any>[],
  onNewItemRequested: ({ type }: { type: string }) => void,
  exportInProgress: boolean,
  onNewParty: (() => void) | undefined,
  onExportToFile: (() => void) | undefined,
  onExportToIpfs: (() => string) | undefined
}) => {
  const classes = useStyles({ rows: 3 });
  const assets = useAssets();
  const [newItemCreationMenuOpen, setNewItemCreationMenuOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [, setRerender] = useState(0);
  const rerender = () => setRerender(value => value + 1);

  // TODO(burdon): Where to store this information?
  const [showDeleted, setShowDeleted] = useState(false);
  const createItemAnchor = useRef(null);

  const topic = party ? party.key.toString() : '';

  const handleNewItemSelected = (type: string) => {
    setNewItemCreationMenuOpen(false);
    onNewItemRequested({ type });
  };

  const handleSelect = (itemId: string) => {
    router.push({ topic: keyToString(party.key.asUint8Array()), item: itemId });
  };

  if (onNewParty) {
    return (
      <Card className={clsx(classes.card, classes.newCard)}>
        <IconButton className={classes.addButton} onClick={onNewParty} name='new-party'>
          <AddIcon className={classes.addIcon} />
        </IconButton>
        <Typography className={classes.addSubtitle} variant='h5'>New Party</Typography>
      </Card>
    );
  }

  useEffect(() => {
    party.update.on(rerender);
  }, [party]);

  const displayName = party.title || 'Untitled';

  if (!party.isActive()) {
    return (
      <>
        <Card className={clsx(classes.card, classes.unsubscribed)}>
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
                className='party-header-title'
              >
                {displayName}
              </Typography>
            }
          />

          <CardActions className={classes.actions}>
            <Button
              size='small'
              color='secondary'
              onClick={async () => party.activate({ global: true })}
            >
              Activate
            </Button>
          </CardActions>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className={classes.card}>
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
              className='party-header-title'
            >
              {displayName}
            </Typography>
          }
          action={(
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
            {items.filter(item => showDeleted || !item.model.getProperty('deleted')).map(item => (
              <ListItem
                key={item.id}
                button
                onClick={() => handleSelect(item.id)}
              >
                <ListItemIcon>
                  <PadIcon type={item.type} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ className: classes.listItemText }}>
                  {item.model.getProperty('title') || 'Untitled'}
                </ListItemText>
                {item.model.getProperty('deleted') ? (
                  <ListItemSecondaryAction>
                    <IconButton edge='end' aria-label='restore' onClick={() => item.model.setProperty('deleted', false)}>
                      <RestoreIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                ) : (
                  <ListItemSecondaryAction>
                    <IconButton size='small' edge='end' aria-label='delete' onClick={() => item.model.setProperty('deleted', true)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </div>

        <CardActions className={classes.actions}>
          <PartyMemberList party={party} onShare={() => setShareDialogOpen(true)} />
          <IconButton
            ref={createItemAnchor}
            size='small'
            edge='end'
            aria-label='add item'
            onClick={() => setNewItemCreationMenuOpen(true)}
          >
            <AddIcon />
          </IconButton>
        </CardActions>
      </Card>

      {/* TODO(burdon): Move outside: don't create this FOR EACH party. */}
      <NewItemCreationMenu
        anchorEl={createItemAnchor.current}
        open={newItemCreationMenuOpen}
        onSelect={handleNewItemSelected}
        onClose={() => setNewItemCreationMenuOpen(false)}
        pads={pads}
      />

      {/* TODO(burdon): Move outside: don't create this FOR EACH party. */}
      <PartySharingDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        party={party}
      />

      {(
        <PartySettingsDialog
          party={party}
          open={settingsDialogOpen}
          properties={{
            showDeleted,
            active: party.isActive()
          }}
          exportInProgress={exportInProgress}
          onExportToFile={onExportToFile}
          onExportToIpfs={onExportToIpfs}
          onClose={async ({ showDeleted, displayName, active }:
            { showDeleted: boolean, displayName: string | undefined, active: boolean }) => {
            if (displayName !== undefined) {
              await party.setTitle(displayName);
            }
            setShowDeleted(showDeleted);
            if (active && !party.isActive()) {
              await party.activate({ global: true });
            }
            if (!active && party.isActive()) {
              await party.deactivate({ global: true });
            }
            setSettingsDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default PartyCard;
