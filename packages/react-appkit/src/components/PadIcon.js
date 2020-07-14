//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { usePads } from '../hooks';

const PadIcon = ({ type }) => {
  const [pads] = usePads();
  const pad = pads.find(pad => pad.type === type);
  return pad ? <pad.icon /> : null;
};

export default PadIcon;
