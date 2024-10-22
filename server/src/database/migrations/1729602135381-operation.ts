import { MigrationInterface, QueryRunner } from "typeorm";

export class Operation1729602135381 implements MigrationInterface {
    name = 'Operation1729602135381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_4165261b35d6a9912d986d6ff77"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_4165261b35d6a9912d986d6ff77" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
