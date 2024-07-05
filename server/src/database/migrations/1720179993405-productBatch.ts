import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatch1720179993405 implements MigrationInterface {
    name = 'ProductBatch1720179993405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "price_per_unit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "full_price" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "full_price"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "price_per_unit"`);
    }

}
