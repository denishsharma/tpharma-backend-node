import { DateTime } from "luxon";
import { BaseModel, column, BelongsTo, belongsTo } from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";
import { OtpTypes } from "App/Helpers/Authentication";

export default class Otp extends BaseModel {
    @column({ isPrimary: true })
    public id: number;

    @column()
    public otp: string;

    @column()
    public phoneNumber: string | null;

    @column()
    public userId: number | null;

    @column({ serialize: (value: string) => OtpTypes[value] ?? null })
    public type: OtpTypes | null;

    @column()
    public payload: string | null;

    @column.dateTime()
    public expiresAt: DateTime;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;

    /**
     * Get the user that owns the otp
     * @type {BelongsTo<typeof User>}
     */
    @belongsTo(() => User)
    public user: BelongsTo<typeof User>;

    /**
     * Check if the otp is expired
     * @return {boolean}
     */
    public isExpired() {
        return this.expiresAt < DateTime.now();
    }
}
