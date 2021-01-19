//
// Copyright 2020 DXOS.org
//

import React, { createContext, useContext, useEffect, useState } from 'react';

import { IconButton, Toolbar, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import AddColumnIcon from '@material-ui/icons/PlaylistAdd';
import { XGrid, LicenseInfo } from '@material-ui/x-grid';

import { createTestInstance } from '@dxos/echo-db';
import { ObjectModel } from '@dxos/object-model';

LicenseInfo.setLicenseKey(
  '8e409f224dbe0bc80df0fa59e719666fT1JERVI6MTg0NDIsRVhQSVJZPTE2MzU4NjkyOTYwMDAsS0VZVkVSU0lPTj0x'
);

export default {
  title: 'Tables'
};

// TODO(burdon): Edit fields.
// TODO(burdon): Column model.
// TODO(burdon): Add Column.
// TODO(burdon): Column types.

/**
 * Custom cell renderer.
 * https://material-ui.com/components/data-grid/rendering/
 */
const textRenderer = (active, field, onCancel) => ({ data: { id }, value }) => {
  if (active.field === field && active.id === id) {
    return (
      <TextField
        autoFocus
        value={value === null ? '' : value}
        onBlur={onCancel}
        onKeyUp={event => {
          if (event.key === 'Escape') {
            onCancel();
          }
        }}
      />
    );
  } else {
    return (
      <>{value}</>
    );
  }
};

// TODO(burdon): From ECHO model.
const useColumns = ({ active = {} } = {}, handleCancel) => {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: 70
    },
    {
      field: 'firstName',
      headerName: 'First name',
      width: 130,
      renderCell: textRenderer(active, 'firstName', handleCancel)
      // TODO(burdon): Menu button.
      // renderHeader: ({ colDef: { headerName } }) => {
      //   return (
      //     <div>{headerName}</div>
      //   );
      // }
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 130,
      renderCell: textRenderer(active, 'lastName', handleCancel)
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 90
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      resizable: true,
      renderCell: textRenderer(active, 'fullName', handleCancel),
      valueGetter: (params) =>
        `${params.getValue('firstName') || ''} ${
          params.getValue('lastName') || ''
        }`
    }
  ];
};

// TODO(burdon): From ECHO model.
const data = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 }
];

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  }
}));

const TestContext = createContext({});

// TODO(burdon): Create hooks.
export const withTable = () => {
  const [{ echo, partyKey }, setEcho] = useState({});
  useEffect(() => {
    setImmediate(async () => {
      // const echo = new ECHO();
      // await echo.open(); // TODO(burdon): Defaults?

      // TODO(burdon): Create party.
      // The option `initialized` should be `initialize`.
      const { echo } = await createTestInstance({ initialized: true });
      const party = await echo.createParty();
      setEcho({ echo, partyKey: party.key });
    });
  }, []);

  return (
    <TestContext.Provider value={{ echo, partyKey }}>
      <Test />
    </TestContext.Provider>
  );
};

// TODO(burdon): Query and mutation.
const withItems = (type) => {
  const [items, setItems] = useState([]);
  const { echo, partyKey } = useContext(TestContext);

  useEffect(() => {
    let unsubscribe;
    if (echo) {
      setImmediate(async () => {
        const party = echo.getParty(partyKey);
        const result = party.database.queryItems({ type });
        unsubscribe = result.subscribe(() => {
          setItems(result.value);
        });
      });
    }

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [echo, partyKey]);

  return items;
};

const withItemMutator = () => {
  const { echo, partyKey } = useContext(TestContext);

  return {
    createItem: async (type, props) => {
      const party = echo.getParty(partyKey);
      return await party.database.createItem({ model: ObjectModel, type, props });
    }
  };
};

const Test = () => {
  const classes = useStyles();
  const [active = {}, setActive] = useState(undefined);
  const columns = useColumns({ active }, () => setActive(undefined));

  // TODO(burdon): Use ECHO to get data.
  const [rows] = useState(data);
  const items = withItems('dxn://dxos.org/item/record');
  const mutator = withItemMutator();

  // TODO(burdon): Set initial data.
  console.log('Items:', JSON.stringify({ items: items.map(item => item.model.getProperty('title')) }));

  const handleAddRow = async () => {
    await mutator.createItem('dxn://dxos.org/item/record', { title: 'Test' });
    // rows.push({ id: rows.length + 1 });
    // setRows(JSON.parse(JSON.stringify(rows)));
  };

  const handleAddColumn = async () => null;

  return (
    <div className={classes.root}>
      <Toolbar variant='dense' disableGutters>
        <IconButton size='small' onClick={handleAddRow}>
          <AddIcon />
        </IconButton>
        <IconButton size='small' onClick={handleAddColumn}>
          <AddColumnIcon />
        </IconButton>
      </Toolbar>

      <div className={classes.gridContainer}>
        <XGrid
          rows={rows}
          columns={columns}
          // hideFooter
          rowHeight={36}
          onCellClick={({ data, field }) => {
            setActive({ id: data.id, field });
          }}
        />
      </div>
    </div>
  );
};
