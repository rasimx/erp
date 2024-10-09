import { MigrationInterface, QueryRunner } from "typeorm";

export class Status1728475064393 implements MigrationInterface {
    name = 'Status1728475064393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."status_event_type_enum" AS ENUM('StatusCreated', 'StatusEdited', 'StatusMOved', 'StatusArchived')`);
        await queryRunner.query(`CREATE TABLE "status_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."status_event_type_enum" NOT NULL, "data" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_19c513fcadeac8558ff0ea634e4" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "PK_4ad5e8dd23606afc75265a093ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "status_id_seq"`);
        await queryRunner.query(`ALTER TABLE "status_event" ADD CONSTRAINT "FK_f3a1bacd7362d05b54dfd92bb28" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "status_event" DROP CONSTRAINT "FK_f3a1bacd7362d05b54dfd92bb28"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "status_id_seq" OWNED BY "status"."id"`);
        await queryRunner.query(`ALTER TABLE "status" ALTER COLUMN "id" SET DEFAULT nextval('"status_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2" FOREIGN KEY ("status_id") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "status_event"`);
        await queryRunner.query(`DROP TYPE "public"."status_event_type_enum"`);
    }

}
