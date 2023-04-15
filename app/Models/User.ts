import { SoftDeletes } from "@ioc:Adonis/Addons/LucidSoftDeletes";
import Hash from "@ioc:Adonis/Core/Hash";
import { compose } from "@ioc:Adonis/Core/Helpers";
import { BaseModel, beforeSave, column, hasMany, HasMany, beforeCreate } from "@ioc:Adonis/Lucid/Orm";
import { UserTypes } from "App/Helpers/User";
import { DateTime } from "luxon";
import Otp from "App/Models/Otp";
import { v4 as uuidv4 } from "uuid";
import { OtpTypes } from "App/Helpers/Authentication";

export default class User extends compose(BaseModel, SoftDeletes) {
    @column({ isPrimary: true, serializeAs: null })
    public id: number;

    @column()
    public uuid: string;

    @column()
    public fid: string | null;

    @column()
    public phoneNumber: string | null;

    @column()
    public email: string;

    @column({ serializeAs: null })
    public password: string;

    @column({ serializeAs: null })
    public rememberMeToken: string | null;

    @column({ serialize: (value: string) => Boolean(value) })
    public isRegistered: boolean;

    @column({ serialize: (value: string) => Boolean(value) })
    public isArchived: boolean;

    @column({ serialize: (value: string) => Boolean(value) })
    public isSuperAdmin: boolean;

    @column({ serialize: (value: string) => Boolean(value) })
    public isSetupCompleted: boolean | null;

    @column({ serialize: (value: string) => Boolean(value) })
    public isVerified: boolean | null;

    @column({ serialize: (value: string) => UserTypes[value] })
    public userType: UserTypes;

    @column.dateTime()
    public emailVerifiedAt: DateTime | null;

    @column.dateTime()
    public lastLoginAt: DateTime | null;

    @column.dateTime()
    public registeredAt: DateTime | null;

    @column.dateTime({ serializeAs: null })
    public deletedAt: DateTime | null;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;

    /**
     * Get user's otps
     * @type {HasMany<typeof Otp>}
     */
    @hasMany(() => Otp)
    public otps: HasMany<typeof Otp>;

    /**
     * Hash password before saving
     * @param {User} user
     * @return {Promise<void>}
     */
    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password);
        }
    }

    /**
     * Generate uuid for user
     * @param {User} user
     * @return {Promise<void>}
     */
    @beforeCreate()
    public static async generateUuid(user: User) {
        user.uuid = uuidv4();
    }

    /**
     * Generate otp for user
     * @param {string} type
     * @param payload
     * @return {Promise<Otp>}
     */
    public async generateOtp(type: OtpTypes, payload: any = null) {
        let otp = await Otp.query().where("user_id", this.id).where("type", type).where("expires_at", ">=", DateTime.fromSeconds(DateTime.now().toSeconds()).toString()).first();

        if (!otp) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            otp = await Otp.create({
                userId: this.id,
                phoneNumber: this.phoneNumber,
                type: type,
                otp: otpCode,
                payload: payload,
                expiresAt: DateTime.fromSeconds(DateTime.now().toSeconds()).plus({ minutes: 5 }),
            });
        }

        return otp;
    }

    /**
     * Verify otp for user
     * @param {string} type
     * @param {string} otp
     * @return {Promise<boolean>}
     */
    public async verifyOtp(type: OtpTypes, otp: string) {
        const otpCode = await Otp.query().where("user_id", this.id).where("type", type).where("expires_at", ">=", DateTime.fromSeconds(DateTime.now().toSeconds()).toString()).where("otp", otp).first();

        if (!otpCode) {
            return false;
        }

        await otpCode.delete();

        return true;
    }
}
