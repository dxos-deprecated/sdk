//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { Chance } from 'chance';

import { useModel } from '@dxos/react-client';
import { ViewModel } from '@dxos/view-model';

import { usePads } from './pads';

const chance = new Chance();

/**
 * Provides view list and view creator.
 * @returns {ViewModel}
 */
export const useViews = (topic) => {
  const [pads] = usePads();
  const model = useModel({ model: ViewModel, options: { type: pads.map(pad => pad.type), topic } });

  return {
    model: model ?? new ViewModel(),
    createView: (type, title, metadata = {}) => {
      assert(model);
      return model.createView(type, title || `item-${chance.word()}`, metadata);
    }
  };
};
