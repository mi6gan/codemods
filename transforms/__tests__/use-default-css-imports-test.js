const define = require('jscodeshift/dist/testUtils').defineTest;

define(__dirname, 'use-default-css-imports');
define(__dirname, 'use-default-css-imports', { ext: '.scss' });
