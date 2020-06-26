//
// Copyright 2018 Wireline, Inc.
//

import { configure, addDecorator } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

addDecorator(StoryRouter());

function loadStories () {
  require('../stories/router.stories.js');
}

configure(loadStories, module);
