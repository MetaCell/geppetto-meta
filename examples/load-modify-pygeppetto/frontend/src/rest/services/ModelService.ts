/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModelService {
    /**
     * Load Model
     * @param modelName
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loadModel(
        modelName: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/model/{model_name}',
            path: {
                'model_name': modelName,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
