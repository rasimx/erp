import { MigrationInterface, QueryRunner } from "typeorm";

export class Uuid21728295072442 implements MigrationInterface {
    name = 'Uuid21728295072442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "PK_d98b31592a819706141d004a4cd"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "PK_d98b31592a819706141d004a4cd"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id")`);
    }

}
