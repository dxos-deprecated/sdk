//
// Copyright 2020 DXOS.org
//

export const download = (data, filename) => {
  const file = new Blob([data], { type: 'text/plain' });
  const element = document.createElement('a');
  element.href = URL.createObjectURL(file);
  element.download = filename;
  element.click();
};

export default download;
