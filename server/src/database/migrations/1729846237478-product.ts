import { MigrationInterface, QueryRunner } from "typeorm";

export class Product1729846237478 implements MigrationInterface {
    name = 'Product1729846237478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_989c8add1a21c46f68addaf32ee"`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "product_read_id_seq"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_a16217909f7806839711e5a1ecc" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_989c8add1a21c46f68addaf32ee" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_989c8add1a21c46f68addaf32ee"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_read_id_seq" OWNED BY "product_read"."id"`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" SET DEFAULT nextval('"product_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_989c8add1a21c46f68addaf32ee" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_a16217909f7806839711e5a1ecc" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
