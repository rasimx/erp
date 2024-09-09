import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBatchClosure1725390970446 implements MigrationInterface {
    name = 'ProductBatchClosure1725390970446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_80a67743f3bdc6e1c9fb9a3fd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_874922539349fcd84562de5d8b"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_64969df926aa8fa3e35a4cf3564"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_711f1e52a7fb4a9445c0ebf469a" PRIMARY KEY ("source_id", "destination_id", "id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "count" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_711f1e52a7fb4a9445c0ebf469a"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_d3ff4d8acdd83728dcabf5cf4ac" PRIMARY KEY ("destination_id", "id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_d3ff4d8acdd83728dcabf5cf4ac"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_774a2d5d0d325d4e1d2ca43f108" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_774a2d5d0d325d4e1d2ca43f108"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_d3ff4d8acdd83728dcabf5cf4ac" PRIMARY KEY ("destination_id", "id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_d3ff4d8acdd83728dcabf5cf4ac"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_711f1e52a7fb4a9445c0ebf469a" PRIMARY KEY ("source_id", "destination_id", "id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "count"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "PK_711f1e52a7fb4a9445c0ebf469a"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "PK_64969df926aa8fa3e35a4cf3564" PRIMARY KEY ("source_id", "destination_id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "id"`);
        await queryRunner.query(`CREATE INDEX "IDX_874922539349fcd84562de5d8b" ON "product_batch_closure" ("destination_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_80a67743f3bdc6e1c9fb9a3fd3" ON "product_batch_closure" ("source_id") `);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
