import { MigrationInterface, QueryRunner } from "typeorm";

export class Status1719038615438 implements MigrationInterface {
    name = 'Status1719038615438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "UQ_2d9afc5535cbbf4febea4d147ba"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "UQ_dd077ddd5cfe2bdba650f26beb8"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "store_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "store_type"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_store_type_enum"`);
        await queryRunner.query(`ALTER TABLE "status" ADD "store_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."status_status_type_enum" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "status" ADD "status_type" "public"."status_status_type_enum" NOT NULL DEFAULT 'custom'`);
        await queryRunner.query(`ALTER TABLE "status" ADD "order" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "status_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "status" ADD CONSTRAINT "UQ_0cf0cfcedada68ced351dcf39f0" UNIQUE ("user_id", "order")`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "UQ_0cf0cfcedada68ced351dcf39f0"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "status_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "status_type"`);
        await queryRunner.query(`DROP TYPE "public"."status_status_type_enum"`);
        await queryRunner.query(`ALTER TABLE "status" DROP COLUMN "store_id"`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_store_type_enum" AS ENUM('ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "store_type" "public"."product_batch_store_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "store_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "UQ_dd077ddd5cfe2bdba650f26beb8" UNIQUE ("status_id", "order")`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "UQ_2d9afc5535cbbf4febea4d147ba" UNIQUE ("store_id", "order")`);
    }

}
