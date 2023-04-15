import { Exception } from "@adonisjs/core/build/standalone";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Response from "App/Helpers/Response";

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ValidationException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ValidationException extends Exception {
    private readonly _data: any;

    constructor(message: string, data: any = undefined) {
        super(message, 422, "E_VALIDATION_ERROR_EXCEPTION");
        this._data = data;
    }

    public async handle(error: this, { response }: HttpContextContract) {
        response.status(error.status).send(Response.createResponse(this._data, error.message));
    }
}
