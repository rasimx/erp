import { MigrationInterface, QueryRunner } from "typeorm";

export class Color1720982488663 implements MigrationInterface {
    name = 'Color1720982488663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "color" character varying NOT NULL DEFAULT '#fff'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "color"`);
    }

}
