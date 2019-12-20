
/**
 *
 * Get the current computed height for the first element in the set of matched elements, including padding but not border.
 *
 * @param el
 */

export function getInnerHeight (el){
  return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
}

/**
 *
 * Get the current computed width for the first element in the set of matched elements, including padding but not border.
 *
 * @param el
 */

export function getInnerWidth (el){
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