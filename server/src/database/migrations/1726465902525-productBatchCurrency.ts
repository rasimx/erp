import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatchCurrency1726465902525 implements MigrationInterface {
    name = 'ProductBatchCurrency1726465902525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "qty" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "currency_cost_price_per_unit" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "exchange_rate" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "exchange_rate"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "currency_cost_price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "qty"`);
    }

}
