import { MigrationInterface, QueryRunner } from "typeorm";

export class Operation1728931764328 implements MigrationInterface {
    name = 'Operation1728931764328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_4165261b35d6a9912d986d6ff77"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63"`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_4165261b35d6a9912d986d6ff77" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63" FOREIGN KEY ("operation_id") REFERENCES "operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63"`);
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_4165261b35d6a9912d986d6ff77"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "operation_read_id_seq" OWNED BY "operation_read"."id"`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" SET DEFAULT nextval('"operation_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63" FOREIGN KEY ("operation_id") REFERENCES "operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "group_operation_read_id_seq" OWNED BY "group_operation_read"."id"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" SET DEFAULT nextval('"group_operation_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_4165261b35d6a9912d986d6ff77" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
