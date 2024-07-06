import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1720255775162 implements MigrationInterface {
    name = 'Init1720255775162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "sku" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "length" integer NOT NULL, "weight" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."status_type_enum" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`CREATE TABLE "status" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "store_id" integer, "type" "public"."status_type_enum" NOT NULL DEFAULT 'custom', "order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."operation_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPrice')`);
        await queryRunner.query(`CREATE TABLE "operation" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "cost" integer NOT NULL, "date" character varying NOT NULL, "proportion_type" "public"."operation_proportion_type_enum" NOT NULL DEFAULT 'equal', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_18556ee6e49c005fc108078f3ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_group" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "status_id" integer NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_1f63a3b6fe2bda212927debdc83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "product_id" integer NOT NULL, "status_id" integer, "order" integer NOT NULL, "parent_id" integer, "group_id" integer, "count" integer NOT NULL, "count_updated" boolean NOT NULL DEFAULT false, "cost_price_per_unit" integer NOT NULL, "operations_price_per_unit" integer NOT NULL, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_dfd61dce60415e9b7acd2321b3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_operation" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "proportion" double precision NOT NULL, "cost" integer NOT NULL, "product_batch_id" integer NOT NULL, "operation_id" integer NOT NULL, CONSTRAINT "PK_44c0226eeb6603ca05b8669a7cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_0bad2a202b239f71250b7575787" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_7b1bb997461ab27a1d570e0cfc4" FOREIGN KEY ("parent_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63" FOREIGN KEY ("operation_id") REFERENCES "operation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_7b1bb997461ab27a1d570e0cfc4"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_0bad2a202b239f71250b7575787"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2"`);
        await queryRunner.query(`DROP TABLE "product_batch_operation"`);
        await queryRunner.query(`DROP TABLE "product_batch"`);
        await queryRunner.query(`DROP TABLE "product_batch_group"`);
        await queryRunner.query(`DROP TABLE "operation"`);
        await queryRunner.query(`DROP TYPE "public"."operation_proportion_type_enum"`);
        await queryRunner.query(`DROP TABLE "status"`);
        await queryRunner.query(`DROP TYPE "public"."status_type_enum"`);
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
