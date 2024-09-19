/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Add } from './Add';
import type { Delete } from './Delete';
import type { Move } from './Move';
import type { Remove } from './Remove';
import type { Set } from './Set';
export type Compound = {
    command_type?: 'compound';
    commands: Array<(Compound | Delete | Move | Remove | Add | Set)>;
};

