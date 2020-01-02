
/**
 *
 * Get the current computed height for the first element in the set of matched elements, including padding but not border.
 *
 * @param el
 */

export function getInnerHeight (el){
  // todo: make sure its the same
  return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
}

/**
 *
 * Get the current computed width for the first element in the set of matched elements, including padding but not border.
 *
 * @param el
 */

export function getInnerWidth (el){
  // todo: make sure its the same
  return parseFloat(getComputedStyle(el, null).width.replace("px", ""))
}

/**
 *
 * Creates function from string
 *
 * @param body
 */

export function strToFunc (body){
  return new Function('x', 'return ' + body + ';');
}

/**
 *
 * Merge the contents of two or more objects together into the first object.
 *
 * @param obj1
 * @param obj2
 */

export function extend (obj1, obj2){
  Object.assign(obj1, obj2);
  return obj1
}

/**
 *
 * Produces a duplicate-free version of the array
 *
 * @param array
 */
export function uniq (array) {
  return [...new Set(array)];
}


/**
 *
 * Creates a new array with the results of calling a function for every array element.
 *
 * @param array
 * @param property
 */
export function pluck (array, property) {
  return array.map(x => x[property])
}

/**
 *
 * Deletes element and child
 *
 * @param cssSelector
 */
export function removeElement (cssSelector){
  const element = document.querySelector(cssSelector);
  if (element){
    element.parentNode.removeChild(element);
  }
}

/**
 *
 * Selects element
 *
 * @param cssSelector
 */
export function selectElement (cssSelector){
  return document.querySelector(cssSelector);
}

/**
 *
 * Sorts a list into groups and returns a count for the number of objects in each group.
 *
 * @param list
 * @param func
 */
export function countBy (list, func){
  let dict = {};
  for (let index in list){
    let key = func(list[index]);
    if (key in dict){
      dict[key]++
    } else {
      dict[key] = 1
    }
  }
  return dict
}


/**
 *
 * Adds eventlistener for each element in class
 *
 * @param classname
 * @param event
 * @param callback
 */
export function addEventListenerClass (classname, event, callback) {
  let classname_el = document.getElementsByClassName(classname);
  for (let i = 0; i < classname_el.length; i++) {
    classname_el[i].addEventListener(event, callback());
  }
}

/**
 *
 * Adds eventlistener for element
 *
 * @param id
 * @param event
 * @param callback
 */
export function addEventListenerId (id, event, callback) {
  let el = document.getElementById(id);
  el.addEventListener(event, callback());
}

