'use strict';

const define = require('../../dist/testUtils').defineTest;

define(__dirname, 'use-default-css-imports');
define(__dirname, 'use-default-css-imports', { ext: '.scss' });
