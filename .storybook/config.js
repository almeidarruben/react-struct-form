import { configure } from '@storybook/react';

import '!style-loader!css-loader!./style.css';

configure(require.context('../examples', true, /\.stories\.js$/), module);
