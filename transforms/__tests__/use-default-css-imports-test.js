'use strict';

const fs = require('fs');
const path = require('path');
const { runInlineTest } = require('jscodeshift/dist/testUtils');

define(__dirname, 'use-default-css-imports');
define(__dirname, 'use-default-css-imports', { ext: '.scss' });

/**
 * Reimplements testUtils.defineTest to support fixtures ext passed in options.
 */
function define(dirName, transformName, options, testFilePrefix) {
  const ext = (options && options.ext) || '.js';

  if (!testFilePrefix) {
    testFilePrefix = transformName;
  }

  const fixtureDir = path.join(dirName, '..', '__testfixtures__');
  const inputPath = path.join(fixtureDir, testFilePrefix + '.input' + ext);
  const testName = `${path.basename(inputPath)} transforms correctly`;
  const source = fs.readFileSync(inputPath, 'utf8');
  const expectedOutput = fs.readFileSync(
    path.join(fixtureDir, testFilePrefix + '.output' + ext),
    'utf8'
  );

  // Assumes transform is one level up from __tests__ directory
  const module = require(path.join(dirName, '..', transformName));
  describe(transformName, () => {
    it(testName, () => {
      runInlineTest(
        module,
        options,
        {
          path: inputPath,
          source,
        },
        expectedOutput
      );
    });
  });
}