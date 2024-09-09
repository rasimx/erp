import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatch1725390007409 implements MigrationInterface {
    name = 'ProductBatch1725390007409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "color"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "color" character varying NOT NULL DEFAULT '#fff'`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "name" character varying NOT NULL`);
    }

}
