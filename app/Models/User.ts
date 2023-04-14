import { SoftDeletes } from "@ioc:Adonis/Addons/LucidSoftDeletes";
import Hash from "@ioc:Adonis/Core/Hash";
import { compose } from "@ioc:Adonis/Core/Helpers";
import { BaseModel, beforeSave, column } from "@ioc:Adonis/Lucid/Orm";
import { UserTypes } from "App/Helpers/User";
import { DateTime } from "luxon";

export default class User extends compose(BaseModel, SoftDeletes) {
    @column({ isPrimary: true })
    public id: number;

    @column()
    public fid: string | null;

    @column()
    public phoneNumber: string | null;

    @column()
    public email: string;

    @column({ serializeAs: null })
    public password: string;

    @column()
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

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password);
        }
    }
}
