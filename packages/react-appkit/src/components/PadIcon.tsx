//
// Copyright 2020 DXOS.org
//

import React from 'react';

import AppIcon from '@material-ui/icons/Apps';

import { usePads } from '../hooks';

type PadType = { type: string }

const PadIcon = ({ type }: PadType) => {
  const [pads] = usePads();

  const pad = pads.find((pad: PadType) => pad.type === type);
  return pad ? <pad.icon /> : <AppIcon />;
};

export default PadIcon;
