import { MigrationInterface, QueryRunner } from "typeorm";

export class Es41727807437338 implements MigrationInterface {
    name = 'Es41727807437338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "product_batch_group_id_seq"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_batch_group_id_seq" START 400`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`DROP SEQUENCE "product_batch_group_id_seq"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_batch_group_id_seq" OWNED BY "product_batch_group"."id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ALTER COLUMN "id" SET DEFAULT nextval('"product_batch_group_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
