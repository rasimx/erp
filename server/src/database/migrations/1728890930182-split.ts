import { MigrationInterface, QueryRunner } from "typeorm";

export class Split1728890930182 implements MigrationInterface {
    name = 'Split1728890930182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" DROP CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_b794064d6ff15eecde78d94fb82"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP CONSTRAINT "FK_0bad2a202b239f71250b7575787"`);
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_cf2147e387e1e198cff2f991fbe"`);
        await queryRunner.query(`ALTER TABLE "operation_read" DROP CONSTRAINT "FK_560e3bb20558d354ee7b4ff904b"`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD "should_split" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "product_read_id_seq" OWNED BY "product_read"."id"`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" SET DEFAULT nextval('"product_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."status_type_enum" RENAME TO "status_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."status_read_type_enum" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" TYPE "public"."status_read_type_enum" USING "type"::"text"::"public"."status_read_type_enum"`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" SET DEFAULT 'custom'`);
        await queryRunner.query(`DROP TYPE "public"."status_type_enum_old"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "group_operation_read_id_seq" OWNED BY "group_operation_read"."id"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" SET DEFAULT nextval('"group_operation_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."group_operation_proportion_type_enum" RENAME TO "group_operation_proportion_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."group_operation_read_proportion_type_enum" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" TYPE "public"."group_operation_read_proportion_type_enum" USING "proportion_type"::"text"::"public"."group_operation_read_proportion_type_enum"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" SET DEFAULT 'equal'`);
        await queryRunner.query(`DROP TYPE "public"."group_operation_proportion_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" DROP CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "operation_read_id_seq" OWNED BY "operation_read"."id"`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" SET DEFAULT nextval('"operation_read_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6" FOREIGN KEY ("set_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_a16217909f7806839711e5a1ecc" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" ADD CONSTRAINT "FK_25fb14776ca51f9a44f9232a855" FOREIGN KEY ("status_id") REFERENCES "status_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" DROP CONSTRAINT "FK_25fb14776ca51f9a44f9232a855"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6"`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" SET DEFAULT nextval('operation_id_seq')`);
        await queryRunner.query(`ALTER TABLE "operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "operation_read_id_seq"`);
        await queryRunner.query(`ALTER TABLE "product_batch_operation" ADD CONSTRAINT "FK_24bc81cb8e3c2e5a0c8ebd04d63" FOREIGN KEY ("operation_id") REFERENCES "operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."group_operation_proportion_type_enum_old" AS ENUM('equal', 'manual', 'weight', 'volume', 'costPricePerUnit', 'costPrice')`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" TYPE "public"."group_operation_proportion_type_enum_old" USING "proportion_type"::"text"::"public"."group_operation_proportion_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "proportion_type" SET DEFAULT 'equal'`);
        await queryRunner.query(`DROP TYPE "public"."group_operation_read_proportion_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."group_operation_proportion_type_enum_old" RENAME TO "group_operation_proportion_type_enum"`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" SET DEFAULT nextval('group_operation_id_seq')`);
        await queryRunner.query(`ALTER TABLE "group_operation_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "group_operation_read_id_seq"`);
        await queryRunner.query(`CREATE TYPE "public"."status_type_enum_old" AS ENUM('custom', 'ozon', 'wb')`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" TYPE "public"."status_type_enum_old" USING "type"::"text"::"public"."status_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "status_read" ALTER COLUMN "type" SET DEFAULT 'custom'`);
        await queryRunner.query(`DROP TYPE "public"."status_read_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."status_type_enum_old" RENAME TO "status_type_enum"`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" SET DEFAULT nextval('product_id_seq')`);
        await queryRunner.query(`ALTER TABLE "product_read" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "product_read_id_seq"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6" FOREIGN KEY ("set_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" DROP COLUMN "should_split"`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_560e3bb20558d354ee7b4ff904b" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operation_read" ADD CONSTRAINT "FK_cf2147e387e1e198cff2f991fbe" FOREIGN KEY ("group_operation_id") REFERENCES "group_operation_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_0bad2a202b239f71250b7575787" FOREIGN KEY ("product_id") REFERENCES "product_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_1f63a3b6fe2bda212927debdc83" FOREIGN KEY ("group_id") REFERENCES "product_batch_group_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_read" ADD CONSTRAINT "FK_b794064d6ff15eecde78d94fb82" FOREIGN KEY ("status_id") REFERENCES "status_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_read" ADD CONSTRAINT "FK_7ddded1cfe6a9d924a8b9e478d2" FOREIGN KEY ("status_id") REFERENCES "status_read"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
