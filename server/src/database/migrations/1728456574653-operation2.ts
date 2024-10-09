import { MigrationInterface, QueryRunner } from "typeorm";

export class Operation21728456574653 implements MigrationInterface {
    name = 'Operation21728456574653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum" RENAME TO "product_batch_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum" AS ENUM('ProductBatchCreated', 'ProductBatchChildCreated', 'ProductBatchEdited', 'ProductBatchMoved', 'ProductBatchDeleted', 'OperationCreated', 'GroupOperationCreated')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum" USING "type"::"text"::"public"."product_batch_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum_old" AS ENUM('ProductBatchCreated', 'ProductBatchChildCreated', 'ProductBatchEdited', 'ProductBatchMoved', 'ProductBatchDeleted', 'OperationCreated')`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "type" TYPE "public"."product_batch_event_type_enum_old" USING "type"::"text"::"public"."product_batch_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum_old" RENAME TO "product_batch_event_type_enum"`);
    }

}
