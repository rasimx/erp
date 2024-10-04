import { MigrationInterface, QueryRunner } from "typeorm";

export class Es31727804295037 implements MigrationInterface {
    name = 'Es31727804295037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" RENAME COLUMN "event_type" TO "type"`);
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_event_type_enum" RENAME TO "product_batch_event_type_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."product_batch_event_type_enum" RENAME TO "product_batch_event_event_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" RENAME COLUMN "type" TO "event_type"`);
    }

}
