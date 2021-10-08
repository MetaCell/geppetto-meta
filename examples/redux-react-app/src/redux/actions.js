// Example actions
export const DATA_LOADING_START = 'DATA_LOADING_START'
export const DATA_LOADING_END = 'DATA_LOADING_END'
export const ADD_DATA_TO_CANVAS = 'ADD_DATA_TO_CANVAS'

export const addDataToCanvas = instance => ({
    type: ADD_DATA_TO_CANVAS,
    data: { instance: instance },
});
