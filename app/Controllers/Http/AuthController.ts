import Hash from "@ioc:Adonis/Core/Hash";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Response from "App/Helpers/Response";
import User from "App/Models/User";

export default class AuthController {
    public async login({ request, auth, response }: HttpContextContract) {
        const { phone_number, password } = request.only(["phone_number", "password"]);

        // get the user by phone number
        const user = await User.findBy("phone_number", phone_number);
        if (!user) {
            return response.status(401).json(Response.createResponse(null, "Invalid credentials"));
        }

        // check if the password is valid
        if (!(await Hash.verify(user.password, password))) {
            return response.status(401).json(Response.createResponse(null, "Invalid credentials"));
        }

        // generate the auth token
        const token = await auth.use("api").generate(user);

        return response.status(200).json(Response.createResponse(token));
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use("api").revoke();
        return response.status(200).json(Response.createResponse(null, "Logged out successfully"));
    }

    public async register({ request, response, auth }: HttpContextContract) {
        const { phone_number, password } = request.only(["phone_number", "password"]);
        const user = await User.create({ phoneNumber: phone_number, password });

        // generate the auth token
        const token = await auth.use("api").generate(user);

        return response.status(200).json(Response.createResponse(token, "Registered successfully"));
    }
}
