import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletGroup1720806072228 implements MigrationInterface {
    name = 'DeletGroup1720806072228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD "deleted_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP COLUMN "deleted_date"`);
    }

}
