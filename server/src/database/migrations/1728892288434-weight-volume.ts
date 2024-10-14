import { MigrationInterface, QueryRunner } from "typeorm";

export class WeightVolume1728892288434 implements MigrationInterface {
    name = 'WeightVolume1728892288434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD "volume" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD "weight" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP COLUMN "volume"`);
    }

}
