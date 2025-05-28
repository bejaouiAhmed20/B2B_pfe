import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePayLaterFields1703000000000 implements MigrationInterface {
    name = 'RemovePayLaterFields1703000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove payLater and payLaterTimeLimit columns from contracts table
        await queryRunner.query(`ALTER TABLE \`contracts\` DROP COLUMN \`payLater\``);
        await queryRunner.query(`ALTER TABLE \`contracts\` DROP COLUMN \`payLaterTimeLimit\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back payLater and payLaterTimeLimit columns if needed to rollback
        await queryRunner.query(`ALTER TABLE \`contracts\` ADD \`payLater\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`contracts\` ADD \`payLaterTimeLimit\` int NULL`);
    }
}
