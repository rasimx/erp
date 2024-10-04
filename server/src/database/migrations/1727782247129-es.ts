import { MigrationInterface, QueryRunner } from "typeorm";

export class Es1727782247129 implements MigrationInterface {
    name = 'Es1727782247129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_event_type_enum" AS ENUM('ProductBatchCreated', 'ProductBatchEdited')`);
        await queryRunner.query(`CREATE TABLE "product_batch_event" ("id" SERIAL NOT NULL, "event_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')), "revision" integer NOT NULL, "aggregate_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "event_type" "public"."product_batch_event_event_type_enum" NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_batch_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_event_type_enum"`);
    }

}
