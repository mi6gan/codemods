'use strict';

const { join, parse, dirname } = require('path');
const { camelCase } = require('lodash');
const cssModuleRenameExports = require('./lib/cssModuleRenameExports');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  options = {
    ...module.exports.defaultOptions,
    ...options,
  };

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

      cssModuleRenameExports(
        join(dirname(fileInfo.path), declPath.value.source.value),
        transformClassName
      );

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
                  ({ value: { local } }) => local.name === value.name
                )
            )
            .replaceWith(({ value }) => {
              const source = specifiers.filter(
                ({ value: { local } }) => local.name === value.name
              );
              return j.identifier(
                `${namespace}.${transformClassName(
                  source.length ? source.get().value.imported.name : value.name
                )}`
              );
            })
        );

      specifiers.remove();
    });

  return root.toSource();

  function transformClassName(className) {
    if (className.startsWith(options.pre)) {
      return camelCase(className.slice(options.pre.length));
    }
    return className;
  }

  function getClassesIdentifierName(esPath, cssPath) {
    const { name: cssName } = parse(parse(cssPath).name);
    const { name: esName } = parse(esPath);
    if (cssName === esName) {
      return options.ns;
    }
    return camelCase(`${cssName}-${options.ns}`);
  }
};

module.exports.defaultOptions = {
  ext: '.module.scss',
  ns: 'classes',
  pre: 'cx',
};

module.exports.parser = 'flow';
