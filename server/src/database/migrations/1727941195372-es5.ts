import { MigrationInterface, QueryRunner } from "typeorm";

export class Es51727941195372 implements MigrationInterface {
    name = 'Es51727941195372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum" RENAME TO "product_batch_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum" AS ENUM('ProductBatchCreated', 'ProductBatchEdited', 'ProductBatchDeleted')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum" USING "type"::"text"::"public"."product_batch_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("aggregate_id", "revision")`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8" UNIQUE ("aggregate_id", "revision")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum_old" AS ENUM('ProductBatchCreated', 'ProductBatchEdited')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum_old" USING "type"::"text"::"public"."product_batch_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum_old" RENAME TO "product_batch_event_type_enum"`);
    }

}
