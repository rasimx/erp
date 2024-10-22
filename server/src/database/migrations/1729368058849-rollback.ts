import { MigrationInterface, QueryRunner } from "typeorm";

export class Rollback1729368058849 implements MigrationInterface {
    name = 'Rollback1729368058849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "status_event" ADD "rollback_target_id" uuid`);
        await queryRunner.query(`ALTER TABLE "status_event" ADD CONSTRAINT "UQ_cd92ee4f70c79b208b6321bfe35" UNIQUE ("rollback_target_id")`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD "rollback_target_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "UQ_532a8bee177d3d6f1b2b4c7de03" UNIQUE ("rollback_target_id")`);
        await queryRunner.query(`ALTER TABLE "product_event" ADD "rollback_target_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_event" ADD CONSTRAINT "UQ_caaa005535e6e799f3846ecbd18" UNIQUE ("rollback_target_id")`);
        await queryRunner.query(`ALTER TABLE "status_event" ADD CONSTRAINT "FK_cd92ee4f70c79b208b6321bfe35" FOREIGN KEY ("rollback_target_id") REFERENCES "status_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" ADD CONSTRAINT "FK_532a8bee177d3d6f1b2b4c7de03" FOREIGN KEY ("rollback_target_id") REFERENCES "product_batch_group_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_event" ADD CONSTRAINT "FK_caaa005535e6e799f3846ecbd18" FOREIGN KEY ("rollback_target_id") REFERENCES "product_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_event" DROP CONSTRAINT "FK_caaa005535e6e799f3846ecbd18"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "FK_532a8bee177d3d6f1b2b4c7de03"`);
        await queryRunner.query(`ALTER TABLE "status_event" DROP CONSTRAINT "FK_cd92ee4f70c79b208b6321bfe35"`);
        await queryRunner.query(`ALTER TABLE "product_event" DROP CONSTRAINT "UQ_caaa005535e6e799f3846ecbd18"`);
        await queryRunner.query(`ALTER TABLE "product_event" DROP COLUMN "rollback_target_id"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP CONSTRAINT "UQ_532a8bee177d3d6f1b2b4c7de03"`);
        await queryRunner.query(`ALTER TABLE "product_batch_group_event" DROP COLUMN "rollback_target_id"`);
        await queryRunner.query(`ALTER TABLE "status_event" DROP CONSTRAINT "UQ_cd92ee4f70c79b208b6321bfe35"`);
        await queryRunner.query(`ALTER TABLE "status_event" DROP COLUMN "rollback_target_id"`);
    }

}
