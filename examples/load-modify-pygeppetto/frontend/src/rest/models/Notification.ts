/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JsonEObject } from './JsonEObject';
export type Notification = {
    kind: ('add' | 'add_many' | 'move' | 'remove' | 'remove_many' | 'set' | 'unset');
    notifier: JsonEObject;
    feature: string;
    old?: (JsonEObject | number | string | boolean | null);
    new?: (JsonEObject | number | string | boolean | null);
};

