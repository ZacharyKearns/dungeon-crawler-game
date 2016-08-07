'use strict';

import 'styles/main.scss';

import React from 'react';
import { render } from 'react-dom';

import DungeonCrawler from 'components/DungeonCrawler/DungeonCrawler';

render(<DungeonCrawler />, document.getElementById('js-main'));
