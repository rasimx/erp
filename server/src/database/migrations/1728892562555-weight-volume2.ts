import { MigrationInterface, QueryRunner } from "typeorm";

export class WeightVolume21728892562555 implements MigrationInterface {
    name = 'WeightVolume21728892562555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP COLUMN "volume"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD "volume" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP COLUMN "volume"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD "volume" integer NOT NULL`);
    }

}
