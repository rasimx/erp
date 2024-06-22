import { MigrationInterface, QueryRunner } from "typeorm";

export class Status1719044129414 implements MigrationInterface {
    name = 'Status1719044129414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "UQ_0cf0cfcedada68ced351dcf39f0"`);
        await queryRunner.query(`ALTER TABLE "status" RENAME COLUMN "status_type" TO "type"`);
        await queryRunner.query(`ALTER TYPE "public"."status_status_type_enum" RENAME TO "status_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."status_type_enum" RENAME TO "status_status_type_enum"`);
        await queryRunner.query(`ALTER TABLE "status" RENAME COLUMN "type" TO "status_type"`);
        await queryRunner.query(`ALTER TABLE "status" ADD CONSTRAINT "UQ_0cf0cfcedada68ced351dcf39f0" UNIQUE ("user_id", "order")`);
    }

}
