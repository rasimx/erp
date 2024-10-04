import { MigrationInterface, QueryRunner } from "typeorm";

export class Es31727803403943 implements MigrationInterface {
    name = 'Es31727803403943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_7b1bb997461ab27a1d570e0cfc4"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_group_event_type_enum" AS ENUM('ProductBatchGroupCreated', 'ProductBatchGroupDeleted', 'ProductBatchGroupMoved')`);
        await queryRunner.query(`CREATE TABLE "product_batch_group_event" ("id" SERIAL NOT NULL, "event_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."product_batch_group_event_type_enum" NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_6f8d9e7cbe003d9939842526257" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "product_batch_id_seq"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_batch_id_seq" START 400`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`DROP SEQUENCE "product_batch_id_seq"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_batch_id_seq" OWNED BY "product_batch"."id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "id" SET DEFAULT nextval('"product_batch_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "parent_id" integer`);
        await queryRunner.query(`DROP TABLE "product_batch_group_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_group_event_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_7b1bb997461ab27a1d570e0cfc4" FOREIGN KEY ("parent_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
