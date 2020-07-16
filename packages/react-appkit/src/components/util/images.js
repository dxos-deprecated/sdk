//
// Copyright 2020 DXOS.org
//

import hash from 'string-hash';

// https://create-react-app.dev/docs/adding-images-fonts-and-files

import banner0 from './images/banner-0.jpg';
import banner1 from './images/banner-1.jpg';
import banner2 from './images/banner-2.jpg';
import banner3 from './images/banner-3.jpg';
import banner4 from './images/banner-4.jpg';
import banner5 from './images/banner-5.jpg';
import banner6 from './images/banner-6.jpg';
import banner7 from './images/banner-7.jpg';
import banner8 from './images/banner-8.jpg';
import banner9 from './images/banner-9.jpg';

// Banner images: 600x300
// TODO(burdon): Remove from appkit (app-specific assets).
// https://www.freepik.com/premium-vector/collection-ten-backgrounds-with-blue-paper-cut_4647794.htm#page=1&query=layers&position=3

const thumbnails = [
  banner0,
  banner1,
  banner2,
  banner3,
  banner4,
  banner5,
  banner6,
  banner7,
  banner8,
  banner9
];

class MediaAssets {
  _thumbnails;

  constructor (props) {
    const { thumbnails = [] } = props;
    this._thumbnails = thumbnails;
  }

  getThumbnail (value) {
    return this._thumbnails[hash(value) % this._thumbnails.length];
  }
}

// TODO(burdon): Inject into provider.
const assets = new MediaAssets({ thumbnails });

export const useAssets = () => {
  return assets;
};
