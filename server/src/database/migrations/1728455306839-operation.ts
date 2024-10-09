import { MigrationInterface, QueryRunner } from "typeorm";

export class Operation1728455306839 implements MigrationInterface {
    name = 'Operation1728455306839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."group_operation_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`CREATE TABLE "group_operation" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "group_id" integer, "name" character varying NOT NULL, "cost" integer NOT NULL, "currency_cost" integer, "exchange_rate" integer, "date" character varying NOT NULL, "proportion_type" "public"."group_operation_proportion_type_enum" NOT NULL DEFAULT 'equal', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_1c19141e75ee7324e788b8bbc57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_event_type_enum" AS ENUM('ProductCreated', 'ProductEdited', 'ProductArchived')`);
        await queryRunner.query(`CREATE TABLE "product_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."product_event_type_enum" NOT NULL, "data" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_9a3a15a5c4ea985ae615c365e67" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "PK_e96757f72afe00f2ed8b4ecc770" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "proportion_type"`);
        await queryRunner.query(`DROP TYPE "public"."operation_proportion_type_enum"`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "proportion" double precision NOT NULL DEFAULT '100'`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "product_batch_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "group_operation_id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum" RENAME TO "product_batch_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum" AS ENUM('ProductBatchCreated', 'ProductBatchChildCreated', 'ProductBatchEdited', 'ProductBatchMoved', 'ProductBatchDeleted', 'OperationCreated')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum" USING "type"::"text"::"public"."product_batch_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "revision" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "aggregate_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_group_event_type_enum" RENAME TO "product_batch_group_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_group_event_type_enum" AS ENUM('ProductBatchGroupCreated', 'ProductBatchGroupDeleted', 'ProductBatchGroupMoved', 'GroupOperationCreated')`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "type" TYPE "public"."product_batch_group_event_type_enum" USING "type"::"text"::"public"."product_batch_group_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_group_event_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("aggregate_id", "revision")`);
        await queryRunner.query(`ALTER TABLE "operation" ADD CONSTRAINT "FK_560e3bb20558d354ee7b4ff904b" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operation" ADD CONSTRAINT "FK_cf2147e387e1e198cff2f991fbe" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_event" ADD CONSTRAINT "FK_cc9a5cb7883a28d96d771cf2c57" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_event" DROP CONSTRAINT "FK_cc9a5cb7883a28d96d771cf2c57"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP CONSTRAINT "FK_cf2147e387e1e198cff2f991fbe"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP CONSTRAINT "FK_560e3bb20558d354ee7b4ff904b"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_group_event_type_enum_old" AS ENUM('ProductBatchGroupCreated', 'ProductBatchGroupDeleted', 'ProductBatchGroupMoved')`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "type" TYPE "public"."product_batch_group_event_type_enum_old" USING "type"::"text"::"public"."product_batch_group_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_group_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_group_event_type_enum_old" RENAME TO "product_batch_group_event_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "aggregate_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "revision" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("aggregate_id", "revision")`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum_old" AS ENUM('ProductBatchCreated', 'ProductBatchChildCreated', 'ProductBatchEdited', 'ProductBatchMoved', 'ProductBatchDeleted')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum_old" USING "type"::"text"::"public"."product_batch_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum_old" RENAME TO "product_batch_event_type_enum"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "group_operation_id"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "product_batch_id"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "proportion"`);
        await queryRunner.query(`CREATE TYPE "public"."operation_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "proportion_type" "public"."operation_proportion_type_enum" NOT NULL DEFAULT 'equal'`);
        await queryRunner.query(`DROP TABLE "product_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "group_operation"`);
        await queryRunner.query(`DROP TYPE "public"."group_operation_proportion_type_enum"`);
    }

}
