import { MigrationInterface, QueryRunner } from "typeorm";

export class Status21728476546180 implements MigrationInterface {
    name = 'Status21728476546180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."status_event_type_enum" RENAME TO "status_event_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."status_event_type_enum" AS ENUM('StatusCreated', 'StatusEdited', 'StatusMoved', 'StatusArchived')`);
        await queryRunner.query(`ALTER TABLE "status_event" ALTER COLUMN "type" TYPE "public"."status_event_type_enum" USING "type"::"text"::"public"."status_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."status_event_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."status_event_type_enum_old" AS ENUM('StatusArchived', 'StatusCreated', 'StatusEdited', 'StatusMOved')`);
        await queryRunner.query(`ALTER TABLE "status_event" ALTER COLUMN "type" TYPE "public"."status_event_type_enum_old" USING "type"::"text"::"public"."status_event_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."status_event_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."status_event_type_enum_old" RENAME TO "status_event_type_enum"`);
    }

}
