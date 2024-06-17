import { MigrationInterface, QueryRunner } from "typeorm";

export class StoreId1718625677909 implements MigrationInterface {
    name = 'StoreId1718625677909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "UQ_b38cc0f217084bba7b352bb5b8d"`);
        await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."status_type_enum"`);
        await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "store_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_store_type_enum" AS ENUM('ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "store_type" "public"."product_batch_store_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "status_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "status_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "store_type"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_store_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "status" ADD "store_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."status_type_enum" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "status" ADD "type" "public"."status_type_enum" NOT NULL DEFAULT 'custom'`);
        await queryRunner.query(`ALTER TABLE "status" ADD CONSTRAINT "UQ_b38cc0f217084bba7b352bb5b8d" UNIQUE ("type", "store_id")`);
    }

}
