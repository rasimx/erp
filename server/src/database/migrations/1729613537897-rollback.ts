import { MigrationInterface, QueryRunner } from "typeorm";

export class Rollback1729613537897 implements MigrationInterface {
    name = 'Rollback1729613537897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status_event" ALTER COLUMN "data" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "data" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_event" ALTER COLUMN "data" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_event" ALTER COLUMN "data" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ALTER COLUMN "data" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "status_event" ALTER COLUMN "data" SET NOT NULL`);
    }

}
