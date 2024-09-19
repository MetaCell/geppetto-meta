/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommandExecution } from '../models/CommandExecution';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Command
     * @returns CommandExecution Successful Response
     * @throws ApiError
     */
    public static commandCommandGet(): CancelablePromise<CommandExecution> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/command/',
        });
    }
}
