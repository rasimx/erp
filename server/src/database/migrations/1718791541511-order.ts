import { MigrationInterface, QueryRunner } from "typeorm";

export class Order1718791541511 implements MigrationInterface {
    name = 'Order1718791541511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "order" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "UQ_2d9afc5535cbbf4febea4d147ba" UNIQUE ("store_id", "order")`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "UQ_dd077ddd5cfe2bdba650f26beb8" UNIQUE ("status_id", "order")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "UQ_dd077ddd5cfe2bdba650f26beb8"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "UQ_2d9afc5535cbbf4febea4d147ba"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "order"`);
    }

}
