/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JsonEObject } from './JsonEObject';
export type Remove = {
    owner: JsonEObject;
    feature: string;
    value?: (JsonEObject | number | string | boolean | null);
    command_type?: 'remove';
    index?: (number | null);
};

