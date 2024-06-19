import { MigrationInterface, QueryRunner } from "typeorm";

export class Closure1718691982966 implements MigrationInterface {
    name = 'Closure1718691982966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_batch_closure" ("ancestor_id" integer NOT NULL, "descendant_id" integer NOT NULL, CONSTRAINT "PK_74d5d36eaccffb5bd7db5148c0e" PRIMARY KEY ("ancestor_id", "descendant_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ab6702799ad0c2786d785e9a88" ON "product_batch_closure" ("ancestor_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0accf4cba3f56925204bf9796" ON "product_batch_closure" ("descendant_id") `);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_ab6702799ad0c2786d785e9a880" FOREIGN KEY ("ancestor_id") REFERENCES "product_batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_b0accf4cba3f56925204bf9796c" FOREIGN KEY ("descendant_id") REFERENCES "product_batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_b0accf4cba3f56925204bf9796c"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_ab6702799ad0c2786d785e9a880"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0accf4cba3f56925204bf9796"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab6702799ad0c2786d785e9a88"`);
        await queryRunner.query(`DROP TABLE "product_batch_closure"`);
    }

}
