//
// Copyright 2020 DXOS.org
//

import React from 'react';

import AppIcon from '@material-ui/icons/Apps';

import { usePads } from '../hooks';

const PadIcon = ({ type }: { type: string }) => {
  const [pads] = usePads();

  const pad = pads.find((pad: { type: string }) => pad.type === type);
  return pad ? <pad.icon /> : <AppIcon />;
};

export default PadIcon;
