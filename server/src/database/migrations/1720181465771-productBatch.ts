import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatch1720181465771 implements MigrationInterface {
    name = 'ProductBatch1720181465771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "cost_price"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "cost_price_per_unit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "operations_price_per_unit" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "operations_price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "cost_price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "price_per_unit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "cost_price" integer NOT NULL`);
    }

}
