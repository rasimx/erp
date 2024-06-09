import { MigrationInterface, QueryRunner } from "typeorm";

export class UserId1717943223299 implements MigrationInterface {
    name = 'UserId1717943223299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ALTER COLUMN "user_id" SET DEFAULT current_setting('rls.user_id')::int`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.userId'))`);
        await queryRunner.query(`ALTER TABLE "product_batch" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.userId'))`);
        await queryRunner.query(`ALTER TABLE "operation" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.userId'))`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.userId'))`);
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "user_id" SET DEFAULT (current_setting('rls.userId'))`);
    }

}
