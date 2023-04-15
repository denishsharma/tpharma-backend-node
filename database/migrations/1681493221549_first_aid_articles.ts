import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
    protected tableName = "first_aid_articles";

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");

            table.string("title").notNullable();
            table.string("slug").notNullable();
            table.string("description").nullable();
            table.text("content", "longtext").notNullable();

            table.timestamp("published_at").nullable();
            table.timestamp("deleted_at").nullable();
            table.timestamps(true, true);
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
