import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSettings1778258331000 implements MigrationInterface {
    name = 'AddUserSettings1778258331000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_new_offers\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_offer_updates\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email_reminders\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`preferred_moving_days\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`preferred_services\` varchar(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`preferred_services\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`preferred_moving_days\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_reminders\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_offer_updates\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email_new_offers\``);
    }
}
