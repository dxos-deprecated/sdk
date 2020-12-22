//
// Copyright 2020 DXOS.org
//

// Note that we can not simply import the debug module here and call its enable, disable
// functions -- if we did that we'd be calling a different instance of the createDebug
// object, with the result that we wouldn't change the log output from the application.

export default ({ hook, bridge }) => {
  bridge.onMessage('debug-logging.enable', ({ data }) => {
    hook.debug.enable(data);
  });
  bridge.onMessage('debug-logging.disable', () => {
    console.log('Disable debug logging');
    return hook.debug.disable();
  });
};
