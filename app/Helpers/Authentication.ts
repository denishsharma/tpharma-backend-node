import User from "App/Models/User";

export enum OtpTypes {
    AUTH = <any>"auth",
    RESET_PASSWORD = <any>"reset_password",
    VERIFY_EMAIL = <any>"verify_email",
}

/**
 * Generate and send otp
 * @param {User} user
 * @return {Promise<Otp>}
 */
export async function generateAndSendOtp(user: User) {
    const otp = await user.generateOtp(OtpTypes.AUTH);

    // send the otp
    console.log({
        otp: otp.otp,
        expiresAt: otp.expiresAt.toString(),
        user: { id: user.uuid, phoneNumber: user.phoneNumber },
    });

    return otp;
}
