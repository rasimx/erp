import { MigrationInterface, QueryRunner } from "typeorm";

export class BatchName1718283323286 implements MigrationInterface {
    name = 'BatchName1718283323286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.user_id'))`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.user_id'))`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.user_id'))`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.user_id'))`);
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.user_id'))`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "name"`);
    }

}
