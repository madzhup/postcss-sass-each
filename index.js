import postcss from 'postcss';
import simpleVars from 'postcss-simple-vars';

const SEPARATOR = /\s+in\s+/;

function checkParams(params) {
  if (!SEPARATOR.test(params)) return 'Missed "in" keyword in @each';

  const [name, values] = params.split(SEPARATOR).map(str => str.trim());

  if (!name.match(/[_a-zA-Z]?\w+/)) return 'Missed variable name in @each';
  if (!values.match(/(\w+,?\s?)+/)) return 'Missed values list in @each';

  return null;
}

function tokenize(str) {
  let inlineStr = str.replace(/(\r\n|\n|\r)/gm, '').trim();
  const match = inlineStr.match(/^\((.*)\)$/);
  inlineStr = match ? match[1] : inlineStr;
  return postcss.list.comma(inlineStr);
}

function paramsList(params) {
  const [vars, list] = params.split(SEPARATOR).map(tokenize);

  const values = list.filter(item => !!item).map((item) => {
    const match = item.match(/^\((.*)\)$/);
    return postcss.list
      .comma(match ? match[1] : item)
      .map(val => val.split(/:/));
  });

  return {
    names: vars,
    values,
  };
}

function replaceEscaped(str) {
  if (str) {
    return str.replace(/#\(/g, '$(');
  }

  return str;
}

function processRules(rule, params) {
  params.values.forEach((value, i) => {
    const vals = {};

    params.names.forEach((name, j) => {
      vals[name] = value[0][j];
    });

    vals.index = i;

    rule.nodes.forEach((node) => {
      const clone = node.clone();
      clone.selector = replaceEscaped(clone.selector);
      clone.selector = replaceEscaped(clone.selector);
      clone.walk((n) => {
        const childNode = n;
        childNode.prop = replaceEscaped(childNode.prop);
        childNode.value = replaceEscaped(childNode.value);
        childNode.params = replaceEscaped(childNode.params);
      });
      const proxy = postcss.rule({ nodes: [clone] });

      simpleVars({ only: vals })(proxy);
      rule.parent.insertBefore(rule, clone);
    });
  });
}

function rulesExists(css) {
  let rulesLength = 0;
  css.walkAtRules('each', () => (rulesLength += 1));
  return rulesLength;
}

function processEach(rule) {
  const params = ` ${rule.params} `;
  const error = checkParams(params);
  if (error) throw rule.error(error);

  const parsedParams = paramsList(params);
  processRules(rule, parsedParams);
  rule.remove();
  // eslint-disable-next-line
  processLoop(rule.root());
}

function processLoop(css, opts) {
  const hasPlugins = opts && opts.plugins;
  let cssTree = css;

  if (hasPlugins && opts.plugins.afterEach && opts.plugins.afterEach.length) {
    cssTree = postcss(opts.plugins.afterEach).process(css).root;
  }

  cssTree.walkAtRules('each', processEach);

  if (hasPlugins && opts.plugins.beforeEach && opts.plugins.beforeEach.length) {
    cssTree = postcss(opts.plugins.beforeEach).process(css).root;
  }

  if (rulesExists(cssTree)) processLoop(cssTree, opts);
}

export default postcss.plugin('postcss-sass-each', (opts = {}) => (
  css => processLoop(css, opts)
));
