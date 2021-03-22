const reactDocs = require('react-docgen');
import React from 'react';

/**
 *
 * Gets the only h1 element in dom
 *
 * @command getTitle (dom)
 *
 * @param dom
 */

function getTitle (dom) {
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

function getDescription (dom) {
  const description = parseInnerHTML(
    dom.querySelector('h1').nextElementSibling.innerHTML
  );
  return React.createElement('span', {}, description);
}

/**
 *
 * Gets the everything from the first h1 sibling element until the next pre element
 *
 * @command getDetailedDescription (dom)
 *
 * @param dom
 */

function getDetailedDescription (dom) {
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

function getReactElement (dom) {
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

function getProps (dom) {
  const path = dom.getElementsByClassName('language-element')[0].innerHTML;
  const src = require('!raw-loader!@geppettoengine/geppetto-ui/'
    + path
    + '.js').default;
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

function getExamples (dom) {
  let examplesDom = getElementsUntil(
    'h2',
    dom.getElementById('examples')
  ).filter(elem => elem.matches('h3'));
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

function getExample (start) {
  let elements = getElementsUntil('pre', start, true);
  let example = { name: start.innerHTML, };
  let description = [];

  for (let elem of elements) {
    if (elem.matches('pre')) {
      const path = elem.children[0].innerText.trim();
      example[
        'component'
      ] = require('@geppettoengine/geppetto-ui/'
        + path
        + '.js').default;
      example[
        'file'
      ] = require('!raw-loader!@geppettoengine/geppetto-ui/'
        + path
        + '.js');
    } else {
      let innerElements = parseInnerHTML(elem.innerHTML);
      description.push(...innerElements);
    }
  }
  example['description'] = React.createElement('div', {}, description);
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

function getLibraries (dom) {
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

function getElementsUntil (selector, start, included = false) {
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

function getContentUntil (selector, start) {
  let elements = [];
  const content = getElementsUntil(selector, start);
  for (let element of content) {
    let innerHTML = element.innerHTML;
    let innerElements = parseInnerHTML(innerHTML);
    if (isOrderedList(element.outerHTML)) {
      const orderedList = React.createElement('ol', {}, innerElements);
      elements.push(orderedList);
    }
    if (isUnorderedList(element.outerHTML)) {
      const unorderedList = React.createElement('ul', {}, innerElements);
      elements.push(unorderedList);
    } else {
      elements.push(...innerElements);
    }
  }
  return React.createElement('div', {}, elements);
}

function parseInnerHTML (innerHTML) {
  let breaks = innerHTML.split(/\n/);
  let elements = [];
  for (let i = 0; i < breaks.length; i++) {
    let b = breaks[i];
    let el;
    if (!isEmpty(b)) {
      if ((el = isLineBreak(b))) {
        b = el;
        const br = React.createElement('br');
        elements.push(br);
      }
      if ((el = isImageTag(b))) {
        const img = React.createElement('img', { src: el });
        elements.push(img);
      } else if ((el = isLinkTag(b))) {
        const children = [];
        for (let j = 0; j < el.length - 2; ) {
          let child;
          if (el[j] === '"' || el[j] === "'") {
            const href = el[j + 1];
            const text = el[j + 2];
            child = React.createElement(
              'a',
              { href: href, target: '_blank' },
              text
            );
            j += 3;
          } else {
            child = el[j];
            j += 1;
          }
          children.push(child);
        }
        const span = React.createElement('p', {
          key: `${i}${b[0]}`,
          children,
        });
        elements.push(span);
      } else if ((el = isList(b))) {
        const list = React.createElement('li', {}, el);
        elements.push(list);
      } else {
        const p = React.createElement('p', { key: `${i}${b[0]}` }, b);
        elements.push(p);
      }
    }
  }
  return elements;
}

function isEmpty (text) {
  return text === '';
}
function isLineBreak (text) {
  return text.includes('<br>') ? text.replace('<br>', '') : false;
}
function isImageTag (text) {
  let re = new RegExp('<img.*?src="(.*?)"');
  let matches = text.match(re);
  return matches ? matches[1] : false;
}

function isLinkTag (text) {
  let re = new RegExp(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1.*?>(.*?)<\/a>/);
  let matches = text.split(re);
  return matches.length > 1 ? matches : false;
}

function isOrderedList (text) {
  // TODO: Improve regex expression to lookup for closing ol
  let re = new RegExp('<ol>');
  let matches = text.match(re);
  return !!matches;
}

function isUnorderedList (text) {
  // TODO: Improve regex expression to lookup for closing ul
  let re = new RegExp('<ul>');
  let matches = text.match(re);
  return !!matches;
}

function isList (text) {
  let re = new RegExp('<li>(.*?)</li>');
  let matches = text.match(re);
  return matches ? matches[1] : false;
}

export function getConfigFromMarkdown (markdown) {
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
