import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductSet1723637938605 implements MigrationInterface {
    name = 'ProductSet1723637938605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_set_closure" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL DEFAULT (current_setting('rls.user_id')::int), "set_id" integer NOT NULL, "product_id" integer NOT NULL, "qty" integer NOT NULL, CONSTRAINT "PK_b3c9b2c9397f0b98e18287b2a76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6" FOREIGN KEY ("set_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" ADD CONSTRAINT "FK_a16217909f7806839711e5a1ecc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_a16217909f7806839711e5a1ecc"`);
        await queryRunner.query(`ALTER TABLE "product_set_closure" DROP CONSTRAINT "FK_e64ec381b6a7dfe4a784f107ed6"`);
        await queryRunner.query(`DROP TABLE "product_set_closure"`);
    }

}
