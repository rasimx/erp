import { MigrationInterface, QueryRunner } from "typeorm";

export class BatchToBatch1723810273429 implements MigrationInterface {
    name = 'BatchToBatch1723810273429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_batch_closure" ("source_id" integer NOT NULL, "destination_id" integer NOT NULL, CONSTRAINT "PK_64969df926aa8fa3e35a4cf3564" PRIMARY KEY ("source_id", "destination_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_80a67743f3bdc6e1c9fb9a3fd3" ON "product_batch_closure" ("source_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_874922539349fcd84562de5d8b" ON "product_batch_closure" ("destination_id") `);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_874922539349fcd84562de5d8b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80a67743f3bdc6e1c9fb9a3fd3"`);
        await queryRunner.query(`DROP TABLE "product_batch_closure"`);
    }

}
