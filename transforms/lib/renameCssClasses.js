const { parse: cssParse } = require('gonzales-pe');

/**
 * TODO: implement as postcss transform
 *
 * Apply `rename` for all exported class names in css module at `path`.
 *
 * @param fileInfo: {path: string, source: string}
 * @param renameFn: (string) => string
 */
module.exports = function renameCssClasses(fileInfo, renameFn) {
  const cssTree = cssParse(fileInfo.source, {
    syntax: fileInfo.path.endsWith('scss') ? 'scss' : 'css',
  });

  // Rename exported classes first.
  cssTree.traverseByType('class', (classNode) => {
    classNode.content.forEach((node) => {
      node.content = renameFn(node.content);
    });
  });

  // Rename classes in composes of css modules.
  cssTree.traverseByType('declaration', (declNode) => {
    let refCount = 0;
    declNode.traverseByTypes(
      ['property', 'value', 'declarationDelimiter'],
      (contentNode) => {
        if (
          contentNode.type === 'property' &&
          contentNode.content[0].content === 'composes'
        ) {
          refCount += 1;
        } else if (
          refCount > 0 &&
          contentNode.type === 'declarationDelimiter'
        ) {
          refCount -= 1;
        } else if (refCount > 0 && contentNode.type === 'value') {
          contentNode.content.forEach((node) => {
            node.content = renameFn(node.content);
          });
        }
      }
    );
  });

  return cssTree.toString();
};
