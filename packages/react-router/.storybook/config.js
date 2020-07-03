//
// Copyright 2020 DXOS.org
//

import { configure, addDecorator } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

addDecorator(StoryRouter());

function loadStories () {
  require('../stories/router.stories.js');
}

configure(loadStories, module);
