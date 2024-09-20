/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AnyCommand } from '../models/AnyCommand';
import type { Notification } from '../models/Notification';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommandsService {
    /**
     * Execute Command
     * @param modelName
     * @param requestBody
     * @returns Notification Successful Response
     * @throws ApiError
     */
    public static executeCommand(
        modelName: string,
        requestBody: AnyCommand,
    ): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/model/{model_name}/commands/execute',
            path: {
                'model_name': modelName,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Commands
     * @param modelName
     * @returns AnyCommand Successful Response
     * @throws ApiError
     */
    public static listCommands(
        modelName: string,
    ): CancelablePromise<Record<string, AnyCommand>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/model/{model_name}/commands',
            path: {
                'model_name': modelName,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Detail Commands
     * @param modelName
     * @param commandId
     * @returns AnyCommand Successful Response
     * @throws ApiError
     */
    public static detailCommands(
        modelName: string,
        commandId: number,
    ): CancelablePromise<AnyCommand> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/model/{model_name}/commands/{command_id}',
            path: {
                'model_name': modelName,
                'command_id': commandId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
