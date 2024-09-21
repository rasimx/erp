import { MigrationInterface, QueryRunner } from "typeorm";

export class Qty1726894630664 implements MigrationInterface {
    name = 'Qty1726894630664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ALTER COLUMN "qty" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ALTER COLUMN "qty" DROP DEFAULT`);
    }

}
