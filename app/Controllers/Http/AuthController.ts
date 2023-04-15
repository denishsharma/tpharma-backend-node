import Hash from "@ioc:Adonis/Core/Hash";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Response from "App/Helpers/Response";
import User from "App/Models/User";
import ValidationException from "App/Exceptions/ValidationException";
import { rules, schema, validator } from "@ioc:Adonis/Core/Validator";
import { generateAndSendOtp, OtpTypes } from "App/Helpers/Authentication";

export default class AuthController {
    public async login({ request, auth, response }: HttpContextContract) {
        const { phone_number, password, mode } = request.only(["phone_number", "password", "mode"]);

        // validate request data
        let validatedData: { mode: "password" | "otp"; phone_number: string; password: string | undefined; };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    mode: schema.enum(["password", "otp"] as const),
                    phone_number: schema.string({ trim: true }),
                    password: schema.string.optional({ trim: true }, [rules.requiredWhen("mode", "=", "password")]),
                }),
                data: { phone_number, password, mode },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            throw new ValidationException(e.message, e.messages);
        }

        // get the user by phone number
        const user = await User.findBy("phone_number", validatedData.phone_number);

        // check for mode is password
        if (validatedData.mode === "password") {
            // check if user exists
            if (!user) {
                return response.status(401).json(Response.createResponse(null, "Invalid credentials"));
            }

            // check if the password is valid
            try {
                if (!(await Hash.verify(user.password, validatedData.password as string))) {
                    return response.status(401).json(Response.createResponse(null, "Invalid credentials"));
                }
            } catch (e) {
                return response.status(401).json(Response.createResponse(null, "Invalid credentials"));
            }

            // generate the auth token
            const token = await auth.use("api").generate(user);

            return response.status(200).json(Response.createResponse({
                user: {
                    id: user.uuid,
                    phone_number: user.phoneNumber,
                },
                token,
            }, "Token generated successfully"));
        }

        // if user does not exist then create the user
        let _user = user as User;
        if (!user) _user = await User.create({ phoneNumber: validatedData.phone_number });

        // generate the otp
        const otp = await generateAndSendOtp(_user);

        return response.status(200).json(Response.createResponse({
            user: {
                id: _user.uuid,
                phone_number: _user.phoneNumber,
            },
            expiresAt: otp.expiresAt.toString(),
        }, "OTP sent successfully"));
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use("api").revoke();
        return response.status(200).json(Response.createResponse(null, "Logged out successfully"));
    }

    public async verify({ request, response, auth }: HttpContextContract) {
        const { user, otp } = request.only(["user", "otp"]);

        // validate request data
        let validatedData: { user: string; otp: string; };
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    user: schema.string({ trim: true }, [rules.uuid(), rules.exists({
                        table: "users",
                        column: "uuid",
                    })]),
                    otp: schema.string({ trim: true }, [rules.minLength(6), rules.maxLength(6)]),
                }),
                data: { user, otp },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            throw new ValidationException(e.message, e.messages);
        }

        // get the user
        const _user = await User.findByOrFail("uuid", validatedData.user);

        // verify the otp
        const isOtpValid = await _user.verifyOtp(OtpTypes.AUTH, validatedData.otp);

        // check if the otp is valid
        if (!isOtpValid) {
            return response.status(401).json(Response.createResponse(null, "Invalid OTP"));
        }

        // generate the auth token
        const token = await auth.use("api").generate(_user);

        return response.status(200).json(Response.createResponse({
            user: {
                id: user.uuid,
                phone_number: user.phoneNumber,
            },
            token,
        }, "Token generated successfully"));
    }

    public async resend({ request, response }: HttpContextContract) {
        const { user } = request.only(["user"]);

        // validate request data
        let validatedData;
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    user: schema.string({ trim: true }, [rules.uuid(), rules.exists({
                        table: "users",
                        column: "uuid",
                    })]),
                }),
                data: { user },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            throw new ValidationException(e.message, e.messages);
        }

        // get the user
        const _user = await User.findByOrFail("uuid", validatedData.user);

        // generate the otp
        const otp = await generateAndSendOtp(_user);

        return response.status(200).json(Response.createResponse({
            user: {
                id: _user.uuid,
                phone_number: _user.phoneNumber,
            },
            expiresAt: otp.expiresAt.toString(),
        }, "OTP sent successfully"));
    }

    public async me({ auth, response }: HttpContextContract) {
        const user = await auth.user! as User;

        return response.status(200).json(Response.createResponse(user, "Authenticated user"));
    }

    public async updatePassword({ request, response, auth }: HttpContextContract) {
        const user = await auth.user! as User;
        const { password, confirm_password } = request.only(["password", "confirm_password"]);

        // validate request data
        let validatedData;
        try {
            validatedData = await validator.validate({
                schema: schema.create({
                    password: schema.string({ trim: true }, [rules.confirmed("confirm_password")]),
                    confirm_password: schema.string({ trim: true }),
                }),
                data: { password, confirm_password },
                reporter: validator.reporters.jsonapi,
            });
        } catch (e) {
            throw new ValidationException(e.message, e.messages);
        }

        // update the password
        user.password = validatedData.password;
        await user.save();

        return response.status(200).json(Response.createResponse(null, "Password updated successfully"));
    }
}
