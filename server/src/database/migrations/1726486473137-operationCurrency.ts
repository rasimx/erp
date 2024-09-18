import { MigrationInterface, QueryRunner } from "typeorm";

export class OperationCurrency1726486473137 implements MigrationInterface {
    name = 'OperationCurrency1726486473137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "currency_cost" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "exchange_rate" integer`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "currency_cost" integer`);
        await queryRunner.query(`ALTER TABLE "operation" ADD "exchange_rate" integer`);
        await queryRunner.query(`ALTER TYPE "public"."operation_proportion_type_enum" RENAME TO "operation_proportion_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."operation_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" TYPE "public"."operation_proportion_type_enum" USING "proportion_type"::"text"::"public"."operation_proportion_type_enum"`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" SET DEFAULT 'equal'`);
        await queryRunner.query(`DROP TYPE "public"."operation_proportion_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."operation_proportion_type_enum_old" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPrice')`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" TYPE "public"."operation_proportion_type_enum_old" USING "proportion_type"::"text"::"public"."operation_proportion_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "proportion_type" SET DEFAULT 'equal'`);
        await queryRunner.query(`DROP TYPE "public"."operation_proportion_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."operation_proportion_type_enum_old" RENAME TO "operation_proportion_type_enum"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "exchange_rate"`);
        await queryRunner.query(`ALTER TABLE "operation" DROP COLUMN "currency_cost"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "exchange_rate"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "currency_cost"`);
    }

}
