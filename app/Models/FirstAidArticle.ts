import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import { compose } from "@ioc:Adonis/Core/Helpers";
import { SoftDeletes } from "@ioc:Adonis/Addons/LucidSoftDeletes";

export default class FirstAidArticle extends compose(BaseModel, SoftDeletes) {
    @column({ isPrimary: true })
    public id: number;

    @column()
    public title: string;

    @column()
    public slug: string;

    @column()
    public description: string | null;

    @column()
    public content: string;

    @column.dateTime()
    public publishedAt: DateTime | null;

    @column.dateTime()
    public deletedAt: DateTime | null;


    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;
}
