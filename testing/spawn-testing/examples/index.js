//
// Copyright 2020 DXOS.org
//

const mri = require('mri');
const args = mri(process.argv.slice(2));

if (args._.length === 0) {
  throw new Error('missing example name');
}

const name = args._[0];

require(`./${name}`)(args);
