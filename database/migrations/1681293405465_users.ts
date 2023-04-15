import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { UserTypes } from "App/Helpers/User";

export default class extends BaseSchema {
    protected tableName = "users";

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id").primary();
            table.uuid("uuid").notNullable().unique();

            table.string("fid").nullable().index().unique();

            table.string("phone_number", 255).nullable().unique();
            table.string("email", 255).nullable().unique();
            table.string("password", 180).notNullable();
            table.string("remember_me_token").nullable();

            table.boolean("is_registered").defaultTo(false);
            table.boolean("is_archived").defaultTo(false);
            table.boolean("is_super_admin").defaultTo(false);
            table.boolean("is_setup_completed").nullable();
            table.boolean("is_verified").defaultTo(false).nullable();

            table.string("user_type").defaultTo(UserTypes.GENERAL).nullable();

            table.timestamp("email_verified_at").nullable();
            table.timestamp("last_login_at").nullable();
            table.timestamp("registered_at").nullable();
            table.timestamp("deleted_at").nullable();

            table.timestamps(true, true);
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
