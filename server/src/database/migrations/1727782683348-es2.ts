import { MigrationInterface, QueryRunner } from "typeorm";

export class Es21727782683348 implements MigrationInterface {
    name = 'Es21727782683348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "aggregate_id" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "aggregate_id" character varying NOT NULL`);
    }

}
