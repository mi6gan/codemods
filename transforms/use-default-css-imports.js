'use strict';

const { parse } = require('path');
const { camelCase } = require('lodash');
const renameCssClasses = require('./lib/renameCssClasses');

module.exports = function(fileInfo, api, options) {
  options = {
    ...module.exports.defaultOptions,
    ...options,
  };

  switch (parse(fileInfo.path).ext) {
    case '.css':
    case '.scss':
      return renameCssClasses(fileInfo, transformClassName);

    default: {
      const j = api.jscodeshift;
      const root = j(fileInfo.source);

      root
        .find(j.ImportDeclaration)
        .filter((declPath) => declPath.value.source.value.endsWith(options.ext))
        .forEach((declPath) => {
          const specifiers = j(declPath)
            .find(j.ImportSpecifier)
            .filter(({ value }) => value.imported.name.startsWith(options.pre));
          const namespace = getClassesIdentifierName(
            fileInfo.path,
            declPath.value.source.value
          );

          const sources = {};

          specifiers
            .filter(({ name }) => name === 0)
            .insertBefore(j.importDefaultSpecifier(j.identifier(namespace)))
            .forEach((specPath) =>
              root
                .find(j.Identifier)
                .filter(
                  ({ parent, value }) =>
                    parent.node !== specPath.node &&
                    value.name !== namespace &&
                    specifiers.some(
                      ({ value: { local } }) =>
                        local && local.name === value.name
                    )
                )
                .replaceWith(({ value }) => {
                  const source = specifiers.filter(
                    ({ value: { local } }) => local.name === value.name
                  );
                  if (source.length) {
                    sources[value.name] = source.get().value.imported.name;
                  }
                  return j.identifier(
                    `${namespace}.${transformClassName(
                      sources[value.name] || value.name
                    )}`
                  );
                })
            );

          specifiers.remove();
        });

      return root.toSource();
    }
  }

  function transformClassName(className) {
    if (className.startsWith(options.pre)) {
      return camelCase(className.slice(options.pre.length));
    }
    return className;
  }

  function getClassesIdentifierName(esPath, cssPath) {
    const { name: cssName } = parse(cssPath);
    const { name: esName } = parse(esPath);
    if (esName.split('.')[0] === cssName.split('.')[0]) {
      return camelCase(options.ns);
    }
    return camelCase(`${cssName}-${options.ns}`);
  }
};

module.exports.defaultOptions = {
  ext: '.scss',
  ns: 'classes',
  pre: 'cx',
};

module.exports.parser = 'flow';
