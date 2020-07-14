//
// Copyright 2020 DXOS.org
//

import hash from 'string-hash';

import banner_0 from './images/banner_0.jpg';
import banner_1 from './images/banner_1.jpg';
import banner_2 from './images/banner_2.jpg';
import banner_3 from './images/banner_3.jpg';
import banner_4 from './images/banner_4.jpg';
import banner_5 from './images/banner_5.jpg';
import banner_6 from './images/banner_6.jpg';
import banner_7 from './images/banner_7.jpg';
import banner_8 from './images/banner_8.jpg';
import banner_9 from './images/banner_9.jpg';

// Banner images: 600x300
// https://www.freepik.com/premium-vector/collection-ten-backgrounds-with-blue-paper-cut_4647794.htm#page=1&query=layers&position=3

const images = [
  banner_0,
  banner_1,
  banner_2,
  banner_3,
  banner_4,
  banner_5,
  banner_6,
  banner_7,
  banner_8,
  banner_9
];

export const getThumbnail = (value) => {
  return images[hash(value) % images.length];
};
