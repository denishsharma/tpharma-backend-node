import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
    protected tableName = "otps";

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");
            table.bigInteger("user_id").unsigned().nullable();
            table.string("phone_number", 20).nullable();

            table.string("otp", 6).notNullable();
            table.string("type").nullable();
            table.json("payload").nullable();
            table.timestamp("expires_at").nullable();

            table.timestamps(true, true);
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
