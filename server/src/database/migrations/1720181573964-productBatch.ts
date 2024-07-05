import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatch1720181573964 implements MigrationInterface {
    name = 'ProductBatch1720181573964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "full_price"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "full_price" integer NOT NULL`);
    }

}
