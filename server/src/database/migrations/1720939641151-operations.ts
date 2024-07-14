import { MigrationInterface, QueryRunner } from "typeorm";

export class Operations1720939641151 implements MigrationInterface {
    name = 'Operations1720939641151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation" ADD "group_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "operations_price" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "operations_price"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "group_id"`);
    }

}
