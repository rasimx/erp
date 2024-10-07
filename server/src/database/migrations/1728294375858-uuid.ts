import { MigrationInterface, QueryRunner } from "typeorm";

export class Uuid1728294375858 implements MigrationInterface {
    name = 'Uuid1728294375858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "request" ("id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_167d324701e6867f189aed52e18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "event_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "event_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD "revision" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "revision" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "request_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "request_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "metadata" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "source_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "source_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "destination_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "destination_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP CONSTRAINT "PK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD "id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD CONSTRAINT "PK_1f63a3b6fe2bda212927debdc83" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "product_batch_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "product_batch_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "PK_dfd61dce60415e9b7acd2321b3a"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "PK_dfd61dce60415e9b7acd2321b3a" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "group_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "group_id" bigint`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "PK_6f8d9e7cbe003d9939842526257"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "PK_6f8d9e7cbe003d9939842526257" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "aggregate_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "PK_d98b31592a819706141d004a4cd"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "aggregate_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("aggregate_id", "revision")`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8" UNIQUE ("aggregate_id", "revision")`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "FK_be5d688a9d6161d865489e2da5e" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "FK_1fb210070df54adc90a34a0568a" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "FK_1fb210070df54adc90a34a0568a"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "FK_be5d688a9d6161d865489e2da5e"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "aggregate_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "PK_d98b31592a819706141d004a4cd"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8" UNIQUE ("revision", "aggregate_id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "aggregate_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "aggregate_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "PK_6f8d9e7cbe003d9939842526257"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "PK_6f8d9e7cbe003d9939842526257" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("revision", "aggregate_id")`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "group_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "group_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP CONSTRAINT "PK_dfd61dce60415e9b7acd2321b3a"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "PK_dfd61dce60415e9b7acd2321b3a" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP COLUMN "product_batch_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD "product_batch_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP CONSTRAINT "PK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" ADD CONSTRAINT "PK_1f63a3b6fe2bda212927debdc83" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "product_batch" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "destination_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "destination_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP COLUMN "source_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD "source_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP COLUMN "request_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "request_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch" DROP COLUMN "revision"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group" DROP COLUMN "revision"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD "event_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "event_id" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "request"`);
    }

}
