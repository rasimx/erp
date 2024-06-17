import { MigrationInterface, QueryRunner } from "typeorm";

export class StoreId1718621471976 implements MigrationInterface {
    name = 'StoreId1718621471976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "UQ_b3fb27554c798eef6e69017c49c"`);
        await queryRunner.query(`ALTER TABLE "status" RENAME COLUMN "account_id" TO "store_id"`);
        await queryRunner.query(`ALTER TABLE "status" ADD CONSTRAINT "UQ_b38cc0f217084bba7b352bb5b8d" UNIQUE ("store_id", "type")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status" DROP CONSTRAINT "UQ_b38cc0f217084bba7b352bb5b8d"`);
        await queryRunner.query(`ALTER TABLE "status" RENAME COLUMN "store_id" TO "account_id"`);
        await queryRunner.query(`ALTER TABLE "status" ADD CONSTRAINT "UQ_b3fb27554c798eef6e69017c49c" UNIQUE ("type", "account_id")`);
    }

}
