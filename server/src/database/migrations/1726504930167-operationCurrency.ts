import { MigrationInterface, QueryRunner } from "typeorm";

export class OperationCurrency1726504930167 implements MigrationInterface {
    name = 'OperationCurrency1726504930167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "currency_cost"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "exchange_rate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "exchange_rate" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "currency_cost" integer`);
    }

}
