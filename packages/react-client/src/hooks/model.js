//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import getDisplayName from 'react-display-name';

import { logs } from '@dxos/debug';

import { useClient } from './client';

const { log, error } = logs('react-client:model');

const defaultOptionsFn = props => props;
const defaultPropsFn = props => props;

export const useModel = ({
  model: modelType,
  options: {
    disableUpdateHandler = false,
    ...options
  }
}) => {
  const client = useClient();

  const [, forceUpdate] = useState(null);
  const [model, setModel] = useState(null);

  log('Render', model && model.id);

  const createModel = () => {
    if (Object.keys(options).length === 0) {
      return;
    }

    let mounted = true;
    let model;

    const onUpdate = () => {
      if (mounted) {
        forceUpdate({});
      }
    };

    const createAsyncModel = async () => {
      model = await client.modelFactory.createModel(modelType, options);

      if (!disableUpdateHandler) {
        model.on('update', onUpdate);
      }

      log('Created', model.id, JSON.stringify(options));

      if (mounted) {
        setModel(model);
      }
    };

    // TODO(burdon): Propagate errors.
    createAsyncModel().then(() => { }, error);

    // Clean-up function runs on componentWillUnmount.
    return () => {
      mounted = false;
      if (model) {
        if (!disableUpdateHandler) {
          model.off('update', onUpdate);
        }
        client.modelFactory.destroyModel(model);

        log('Destroyed', model.id);
        model = null;
      }
    };
  };

  // See https://www.npmjs.com/package/use-deep-compare-effect
  // We need a deep object compare for this effect since `options` is an object and React's useEffect doesn't support it.
  useDeepCompareEffect(() => createModel(), [options]);

  return model;
};

export const withModel = config => WrappedComponent => {
  const {
    model: modelType,
    options: optionsFn = defaultOptionsFn,
    props: propsFn = defaultPropsFn
  } = config;

  const Component = (componentProps) => {
    const options = optionsFn(componentProps);

    const model = useModel({ model: modelType, options });

    return (
      <>
        {model && (
          <WrappedComponent
            {...componentProps}
            {...propsFn({ ...componentProps, model }, options)}
          />
        )}
      </>
    );
  };

  Component.displayName = `withModel(${getDisplayName(WrappedComponent)})`;
  return Component;
};
