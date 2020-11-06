#!/bin/sh

#
# Sets-up and tears down yarn links from SDK monorepo packages to target.
#
# NOTE: Linking react libraries is not straightforward, because you have to make sure there is only one
# instance of the react module (otherwise hooks and other things do not work properly.)
#
# NOTE: Linked packages have symlinks to ~/.config/yarn/link/<PACKAGE>
#

DEFAULT_TARGET_DIR="../teamwork"

NODE_MODULES=("react" "react-dom" "react-router-dom" "@material-ui/core")
DXOS_MODULES=("client" "react-appkit" "react-client" "react-router" "react-ux")

function link
{
  TARGET_DIR=${1:-${DEFAULT_TARGET_DIR}}
  echo "Linking ${TARGET_DIR}"

  yarn install
  yarn build

  for m in ${NODE_MODULES[*]}; do
    pushd node_modules/${m} > /dev/null
    yarn link
    popd > /dev/null
  done

  for m in ${DXOS_MODULES[*]}; do
    pushd packages/${m} > /dev/null
    yarn link
    popd > /dev/null
  done

  pushd ${TARGET_DIR} > /dev/null
  yarn install
  yarn build

  for m in ${NODE_MODULES[*]}; do
    yarn link $m
  done

  for m in ${DXOS_MODULES[*]}; do
    yarn link "@dxos/$m"
  done

  popd > /dev/null
  echo "OK"
}

function unlink
{
  TARGET_DIR=${1:-${DEFAULT_TARGET_DIR}}
  echo "Unlinking ${TARGET_DIR}"

  for m in ${NODE_MODULES[*]}; do
    pushd node_modules/${m} > /dev/null
    yarn unlink
    popd > /dev/null
  done

  for m in ${DXOS_MODULES[*]}; do
    pushd packages/${m} > /dev/null
    yarn unlink
    popd > /dev/null
  done

  pushd ${TARGET_DIR} > /dev/null

  rm -rf node_modules
  yarn install
  yarn build

  popd > /dev/null
  echo "OK"
}

case $1 in
  link)
    shift
    link $1
    ;;

  unlink)
    shift
    unlink $1
    ;;

  *)
    echo "$0 link|unlink [${DEFAULT_TARGET_DIR}]"
    ;;
esac
