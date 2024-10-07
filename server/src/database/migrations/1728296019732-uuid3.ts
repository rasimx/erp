import { MigrationInterface, QueryRunner } from "typeorm";

export class Uuid31728296019732 implements MigrationInterface {
    name = 'Uuid31728296019732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "metadata" jsonb`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "metadata" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" ALTER COLUMN "metadata" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "metadata"`);
    }

}
