import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1728888550168 implements MigrationInterface {
    name = 'Init1728888550168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "request" ("id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "rollback_target_id" uuid, CONSTRAINT "REL_6d58fd30916da02deb584743c9" UNIQUE ("rollback_target_id"), CONSTRAINT "PK_167d324701e6867f189aed52e18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."status_event_type_enum" AS ENUM('StatusCreated', 'StatusEdited', 'StatusMoved', 'StatusArchived', 'Rollback')`);
        await queryRunner.query(`CREATE TABLE "status_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."status_event_type_enum" NOT NULL, "data" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_19c513fcadeac8558ff0ea634e4" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "PK_4ad5e8dd23606afc75265a093ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_set_closure" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "set_id" integer NOT NULL, "product_id" integer NOT NULL, "qty" integer NOT NULL, CONSTRAINT "PK_b3c9b2c9397f0b98e18287b2a76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_read" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "sku" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "length" integer NOT NULL, "weight" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "revision" integer NOT NULL, CONSTRAINT "UQ_67d256bc37265ed4ef70b10e2b3" UNIQUE ("sku"), CONSTRAINT "PK_2f94bc27320d1ee43c49fd9ee7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_event_type_enum" AS ENUM('ProductBatchCreated', 'ProductBatchChildCreated', 'ProductBatchEdited', 'ProductBatchMoved', 'ProductBatchDeleted', 'OperationAdded', 'GroupOperationAdded', 'Rollback')`);
        await queryRunner.query(`CREATE TABLE "product_batch_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."product_batch_event_type_enum" NOT NULL, "data" jsonb, "metadata" jsonb, "rollback_target_id" uuid, CONSTRAINT "UQ_6bf74ec68f3b39d9e88d9857da8" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "REL_ca1bd84291373d49623abd78a9" UNIQUE ("rollback_target_id"), CONSTRAINT "PK_d98b31592a819706141d004a4cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."status_read_type_enum" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`CREATE TABLE "status_read" ("id" integer NOT NULL, "title" character varying NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "store_id" integer, "type" "public"."status_read_type_enum" NOT NULL DEFAULT 'custom', "order" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "revision" integer NOT NULL, CONSTRAINT "PK_b33b18741364ab07c1f575a168f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_batch_group_event_type_enum" AS ENUM('ProductBatchGroupCreated', 'ProductBatchGroupDeleted', 'ProductBatchGroupMoved', 'GroupOperationAdded', 'Rollback')`);
        await queryRunner.query(`CREATE TABLE "product_batch_group_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer, "aggregate_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."product_batch_group_event_type_enum" NOT NULL, "data" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_9d978e0e92e4809615b835f4e57" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "PK_6f8d9e7cbe003d9939842526257" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_event_type_enum" AS ENUM('ProductCreated', 'ProductEdited', 'ProductArchived', 'Rollback')`);
        await queryRunner.query(`CREATE TABLE "product_event" ("id" uuid NOT NULL, "request_id" uuid NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "revision" integer NOT NULL, "aggregate_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."product_event_type_enum" NOT NULL, "data" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "UQ_9a3a15a5c4ea985ae615c365e67" UNIQUE ("aggregate_id", "revision"), CONSTRAINT "PK_e96757f72afe00f2ed8b4ecc770" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_closure" ("id" SERIAL NOT NULL, "source_id" integer NOT NULL, "destination_id" integer NOT NULL, "count" integer NOT NULL, "qty" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_774a2d5d0d325d4e1d2ca43f108" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_group_read" ("id" integer NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "name" character varying NOT NULL, "status_id" integer NOT NULL, "order" integer NOT NULL, "deleted_date" TIMESTAMP, "revision" integer NOT NULL, CONSTRAINT "PK_53f42b20e9003d548eddd1717af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_operation" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "proportion" double precision NOT NULL, "cost" integer NOT NULL, "product_batch_id" integer NOT NULL, "operation_id" integer NOT NULL, CONSTRAINT "PK_44c0226eeb6603ca05b8669a7cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_batch_read" ("id" integer NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "product_id" integer NOT NULL, "status_id" integer, "order" integer NOT NULL, "group_id" integer, "count" integer NOT NULL, "initial_count" integer NOT NULL, "count_updated" boolean NOT NULL DEFAULT false, "cost_price_per_unit" integer NOT NULL, "currency_cost_price_per_unit" integer, "exchange_rate" integer, "operations_price_per_unit" integer NOT NULL, "operations_price" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "revision" integer NOT NULL, CONSTRAINT "PK_6a999c6ab6bb65b44ef9bc13dfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "operation_read" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "group_id" integer, "name" character varying NOT NULL, "cost" integer NOT NULL, "currency_cost" integer, "exchange_rate" integer, "date" character varying NOT NULL, "proportion" double precision NOT NULL DEFAULT '100', "product_batch_id" integer NOT NULL, "group_operation_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_f611ab9b6467c807a51db274840" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."group_operation_read_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`CREATE TABLE "group_operation_read" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "group_id" integer, "name" character varying NOT NULL, "cost" integer NOT NULL, "currency_cost" integer, "exchange_rate" integer, "date" character varying NOT NULL, "proportion_type" "public"."group_operation_read_proportion_type_enum" NOT NULL DEFAULT 'equal', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, CONSTRAINT "PK_379a72b913ab99ee56eb2ba9df6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "request" ADD CONSTRAINT "FK_6d58fd30916da02deb584743c94" FOREIGN KEY ("rollback_target_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "status_event" ADD CONSTRAINT "FK_f3a1bacd7362d05b54dfd92bb28" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6" FOREIGN KEY ("set_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_a16217909f7806839711e5a1ecc" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "FK_1fb210070df54adc90a34a0568a" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" ADD CONSTRAINT "FK_ca1bd84291373d49623abd78a96" FOREIGN KEY ("rollback_target_id") REFERENCES "product_batch_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "FK_be5d688a9d6161d865489e2da5e" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_event" ADD CONSTRAINT "FK_cc9a5cb7883a28d96d771cf2c57" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f" FOREIGN KEY ("source_id") REFERENCES "product_batch_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" ADD CONSTRAINT "FK_874922539349fcd84562de5d8b0" FOREIGN KEY ("destination_id") REFERENCES "product_batch_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" ADD CONSTRAINT "FK_25fb14776ca51f9a44f9232a855" FOREIGN KEY ("status_id") REFERENCES "status_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63" FOREIGN KEY ("operation_id") REFERENCES "operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_989c8add1a21c46f68addaf32ee" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_b9bdb1dd25f02e42fb4e04a0157" FOREIGN KEY ("status_id") REFERENCES "status_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_9eb994f3160d77403d63b1fe025" FOREIGN KEY ("group_id") REFERENCES "product_batch_group_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_bf6041324365e9c5ffa22ebe624" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_4165261b35d6a9912d986d6ff77" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_4165261b35d6a9912d986d6ff77"`);
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_bf6041324365e9c5ffa22ebe624"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_9eb994f3160d77403d63b1fe025"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_b9bdb1dd25f02e42fb4e04a0157"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_989c8add1a21c46f68addaf32ee"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_8fe9d5567df7c0a63a6da13344f"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" DROP CONSTRAINT "FK_25fb14776ca51f9a44f9232a855"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_874922539349fcd84562de5d8b0"`);
        await queryRunner.query(`ALTER TABLE "product_batch_closure" DROP CONSTRAINT "FK_80a67743f3bdc6e1c9fb9a3fd3f"`);
        await queryRunner.query(`ALTER TABLE "product_event" DROP CONSTRAINT "FK_cc9a5cb7883a28d96d771cf2c57"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "FK_be5d688a9d6161d865489e2da5e"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "FK_ca1bd84291373d49623abd78a96"`);
        await queryRunner.query(`ALTER TABLE "product_batch_event" DROP CONSTRAINT "FK_1fb210070df54adc90a34a0568a"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6"`);
        await queryRunner.query(`ALTER TABLE "status_event" DROP CONSTRAINT "FK_f3a1bacd7362d05b54dfd92bb28"`);
        await queryRunner.query(`ALTER TABLE "request" DROP CONSTRAINT "FK_6d58fd30916da02deb584743c94"`);
        await queryRunner.query(`DROP TABLE "group_operation_read"`);
        await queryRunner.query(`DROP TYPE "public"."group_operation_read_proportion_type_enum"`);
        await queryRunner.query(`DROP TABLE "operation_read"`);
        await queryRunner.query(`DROP TABLE "product_batch_read"`);
        await queryRunner.query(`DROP TABLE "product_batch_operation"`);
        await queryRunner.query(`DROP TABLE "product_batch_group_read"`);
        await queryRunner.query(`DROP TABLE "product_batch_closure"`);
        await queryRunner.query(`DROP TABLE "product_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "product_batch_group_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_group_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "status_read"`);
        await queryRunner.query(`DROP TYPE "public"."status_read_type_enum"`);
        await queryRunner.query(`DROP TABLE "product_batch_event"`);
        await queryRunner.query(`DROP TYPE "public"."product_batch_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "product_read"`);
        await queryRunner.query(`DROP TABLE "product_set_closure"`);
        await queryRunner.query(`DROP TABLE "status_event"`);
        await queryRunner.query(`DROP TYPE "public"."status_event_type_enum"`);
        await queryRunner.query(`DROP TABLE "request"`);
    }

}
