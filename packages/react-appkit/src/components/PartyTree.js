//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import React, { useState, useEffect, useCallback, forwardRef } from 'react';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { grey, green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ItemIcon from '@material-ui/icons/DescriptionOutlined';
import FolderIcon from '@material-ui/icons/FolderOpen';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';

import { keyToString } from '@dxos/crypto';
import { EditableText } from '@dxos/react-ux';

import { MemberList } from './MemberList';

const treeItemBaseStyles = theme => ({
  root: {
    paddingTop: theme.spacing(1),

    color: theme.palette.text.secondary,
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover
    },

    '&$selected > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${grey[400]})`,
      color: 'white'
    },

    '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
      backgroundColor: 'transparent'
    }
  },

  content: {
    color: theme.palette.text.secondary,

    // borderTopRightRadius: theme.spacing(2),
    // borderBottomRightRadius: theme.spacing(2),
    // paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular
    }
  },

  expanded: {},

  selected: {},

  group: {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2)
    }
  },

  label: {
    fontWeight: 'inherit',
    color: 'inherit',
    overflow: 'hidden'
  }
});

const useTreeItemStyles = makeStyles(treeItemBaseStyles);

const treeAddItemBaseStyles = theme => ({
  ...treeItemBaseStyles(theme),
  root: {
    ...treeItemBaseStyles(theme).root,

    '&$selected > $content': {
      backgroundColor: 'transparent'
    },

    '&$selected > $content $label:hover, &$selected:focus > $content $label': {
      backgroundColor: 'transparent'
    }
  }
});

const useTreeAddItemStyles = makeStyles(treeAddItemBaseStyles);

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    flex: 1
  },

  selectedTopic: {
    '& > div:first-child': {
      backgroundColor: theme.palette.action.hover
    }
  },

  labelRoot: {
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0)
  },

  labelIcon: {
    marginRight: theme.spacing(1)
  },

  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  addItem: {
    color: green[500]
  },

  toolbar: {
    padding: theme.spacing(2)
  }
}));

const TYPE_PARTY = 'party';

const ItemLabel = ({ icon: Icon, className, classes, children }) => (
  <div className={clsx(classes.labelRoot, className)}>
    <Icon className={classes.labelIcon} />
    <Typography variant='body2' className={classes.labelText}>
      {children}
    </Typography>
  </div>
);

const EditableLabel = ({ icon: Icon, className, classes, label, onUpdate }) => (
  <div className={clsx(classes.labelRoot, className)}>
    <Icon className={classes.labelIcon} />
    <EditableText
      variant='body2'
      value={label}
      onUpdate={onUpdate}
      className={classes.labelText}
    />
  </div>
);

export const PartyTreeAddItemButton = forwardRef(({ onClick, children }, ref) => {
  const treeAddItemClasses = useTreeAddItemStyles();
  const classes = useStyles();

  const handleClick = useCallback(event => {
    event.stopPropagation();
    onClick(event);
  }, [onClick]);

  return (
    <TreeItem
      ref={ref}
      classes={treeAddItemClasses}
      nodeId='__ADD__'
      selected={false}
      onClick={handleClick}
      label={(
        <ItemLabel icon={AddIcon} className={classes.addItem} classes={classes}>
          {children}
        </ItemLabel>
      )}
    />
  );
});

export const PartyTreeItem = ({ id, label, icon = ItemIcon, isSelected, onSelect, onUpdate }) => {
  const treeItemClasses = useTreeItemStyles();
  const classes = useStyles();

  return (
    <TreeItem
      classes={treeItemClasses}
      className={clsx(isSelected && treeItemClasses.selected)}
      key={id}
      nodeId={id}
      selected={isSelected}
      onClick={onSelect}
      label={onUpdate
        ? <EditableLabel icon={icon} classes={classes} label={label} onUpdate={onUpdate} />
        : <ItemLabel icon={icon} classes={classes}>{label}</ItemLabel>}
    />
  );
};

const PartyTree = ({ parties, items = () => <></>, selected, onSelect, onCreate }) => {
  const classes = useStyles();
  const treeItemClasses = useTreeItemStyles();
  const [expanded, setExpanded] = useState([]);

  const createId = (type, id) => `${type}/${id}`;
  const parseId = id => id.split('/');

  useEffect(() => {
    if (!parties) {
      return;
    }
    setExpanded([createId(TYPE_PARTY, selected)]);
  }, []);

  if (!parties) {
    return null;
  }

  const handleSelect = (event, nodeId) => {
    if (onSelect) {
      const [, topic] = parseId(nodeId);
      if (topic) {
        onSelect(topic);
      }
    }
  };

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const selectedParty = parties.find(party => keyToString(party.key) === selected);

  // TODO(burdon): Factor out control buttons.
  return (
    <div className={classes.root}>
      <TreeView
        selected={[]}
        expanded={expanded}
        onNodeSelect={handleSelect}
        onNodeToggle={handleToggle}
      >
        {parties.map((partyInfo) => {
          const topic = keyToString(partyInfo.publicKey);
          return (
            <TreeItem
              key={createId(TYPE_PARTY, topic)}
              nodeId={createId(TYPE_PARTY, topic)}
              label={<ItemLabel icon={FolderIcon} classes={classes}>{partyInfo.displayName}</ItemLabel>}
              className={clsx(topic === selected && classes.selectedTopic)}
              classes={treeItemClasses}
            >
              {items(topic)}
            </TreeItem>
          );
        })}
      </TreeView>

      {onCreate && (
        <div className={classes.toolbar}>
          <Button
            variant='contained'
            size='small'
            color='primary'
            startIcon={<AddIcon />}
            onClick={onCreate}
          >
            Party
          </Button>
        </div>
      )}

      {selectedParty && (
        <>
          <Divider />
          <MemberList party={selectedParty} />
        </>
      )}
    </div>
  );
};

export default PartyTree;
