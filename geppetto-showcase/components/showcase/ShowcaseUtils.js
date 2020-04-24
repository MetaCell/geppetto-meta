const reactDocs = require('react-docgen');

/**
 *
 * Gets the only h1 element in dom
 *
 * @command getTitle (dom)
 *
 * @param dom
 */

function getTitle(dom) {
  return dom.querySelector('h1').innerHTML;
}

/**
 *
 * Gets the next sibling of the h1 element
 *
 * @command getDescription (dom)
 *
 * @param dom
 */

function getDescription(dom) {
  return dom.querySelector('h1').nextElementSibling.innerText;
}

/**
 *
 * Gets the everything from the first h1 sibling element until the next pre element
 *
 * @command getDetailedDescription (dom)
 *
 * @param dom
 */

function getDetailedDescription(dom) {
  return getContentUntil('pre', dom.querySelector('h1').nextElementSibling);
}

/**
 *
 * Gets trimmed value after last slash of code block labelled with element
 *
 * @command getReactElement (dom)
 *
 * @param dom
 */

function getReactElement(dom) {
  return dom
    .getElementsByClassName('language-element')[0]
    .innerHTML.split('/')
    .pop()
    .trim();
}

/**
 *
 * Gets the props of the component
 *
 * @command getProps (dom)
 *
 * @param dom
 */

function getProps(dom) {
  const path = dom.getElementsByClassName('language-element')[0].innerHTML;
  const src = require('!raw-loader!../../../geppetto-ui/src/components/' +
    path +
    '.js').default;
  const componentInfo = reactDocs.parse(src);
  return componentInfo.props;
}

/**
 *
 * Gets an array with all the examples content
 *
 * @command getExamples (dom)
 *
 * @param dom
 */

function getExamples(dom) {
  let examplesDom = getElementsUntil(
    'h2',
    dom.getElementById('examples')
  ).filter((elem) => elem.matches('h3'));
  let examples = [];
  while (examplesDom.length) {
    examples.push(getExample(examplesDom.pop()));
  }
  return examples;
}

/**
 *
 * Gets all the example content
 *
 * @command getExample (start)
 *
 * @param start
 */

function getExample(start) {
  let elements = getElementsUntil('pre', start, true);
  let example = {
    name: start.innerHTML,
    description: '',
  };

  for (let elem of elements) {
    if (elem.matches('pre')) {
      const path = elem.children[0].innerText.trim();
      example['component'] = require('../../../geppetto-ui/src/components/' +
        path +
        '.js').default;
      example[
        'file'
      ] = require('!raw-loader!../../../geppetto-ui/src/components/' +
        path +
        '.js');
    } else {
      example['description'] += elem.innerHTML;
    }
  }

  return example;
}

/**
 *
 * Gets an array with all the libraries
 *
 * @command getLibraries (dom)
 *
 * @param dom
 */

function getLibraries(dom) {
  let libraries = [];
  let librariesDOM = getElementsUntil('h2', dom.getElementById('libraries'));
  for (let library of librariesDOM) {
    libraries.push({
      name: library.children[0].innerHTML,
      href: library.children[0].href,
    });
  }
  return libraries;
}

function getElementsUntil(selector, start, included = false) {
  let siblings = [];
  let elem = start.nextElementSibling;
  while (elem) {
    if (elem.matches(selector)) {
      if (included) {
        siblings.push(elem);
      }
      break;
    }
    siblings.push(elem);
    elem = elem.nextElementSibling;
  }
  return siblings;
}

function getContentUntil(selector, start) {
  return getElementsUntil(selector, start).reduce(
    (str, elem) => str + elem.innerHTML,
    ''
  );
}

export function getConfigFromMarkdown(markdown) {
  let dom = new DOMParser().parseFromString(markdown, 'text/html');
  let configs = {};
  configs['name'] = getTitle(dom);
  configs['description'] = getDescription(dom);
  configs['detailedDescription'] = getDetailedDescription(dom);
  configs['reactElement'] = getReactElement(dom);
  configs['props'] = getProps(dom);
  configs['examples'] = getExamples(dom);
  configs['libraries'] = getLibraries(dom);
  return configs;
}
