import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777653581828 implements MigrationInterface {
    name = 'InitialSchema1777653581828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`company_documents\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`company_id\` int UNSIGNED NOT NULL, \`document_type\` enum ('TRADE_LICENSE', 'INSURANCE', 'OTHER') NOT NULL DEFAULT 'OTHER', \`file_name\` varchar(255) NOT NULL, \`file_url\` varchar(500) NOT NULL, \`mime_type\` varchar(50) NOT NULL, \`file_size_bytes\` int UNSIGNED NOT NULL, \`status\` enum ('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING', \`verified_by\` int UNSIGNED NULL, \`verified_at\` datetime NULL, \`rejection_reason\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`IDX_afefd11563ac4d457c3af03d6e\` (\`deleted_at\`), INDEX \`IDX_d595803a45594d373bcb8c6045\` (\`status\`), INDEX \`IDX_43830ec86bb6c8a2f2bc1f2b5f\` (\`company_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`companies\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`user_id\` int UNSIGNED NOT NULL, \`company_name\` varchar(200) NOT NULL, \`slug\` varchar(200) NOT NULL, \`description\` text NULL, \`logo_url\` varchar(500) NULL, \`website\` varchar(255) NULL, \`phone\` varchar(50) NULL, \`email\` varchar(255) NULL, \`tax_id\` varchar(50) NULL, \`status\` enum ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING', \`approved_at\` datetime NULL, \`approved_by\` int UNSIGNED NULL, \`rejection_reason\` text NULL, \`service_area_json\` varchar(255) NULL, \`average_rating\` decimal(3,2) NULL, \`total_reviews\` int UNSIGNED NOT NULL DEFAULT '0', \`commission_rate\` decimal(5,2) NOT NULL DEFAULT '0.12', \`is_verified\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`IDX_3b873f30fa6aaf3578d6a677a3\` (\`deleted_at\`), INDEX \`IDX_fa5b148ef2ac03342ed8d9078b\` (\`status\`), UNIQUE INDEX \`IDX_b28b07d25e4324eee577de5496\` (\`slug\`), UNIQUE INDEX \`REL_ee0839cba07cb0c52602021ad4\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`phone\` varchar(50) NULL, \`role\` enum ('END_CUSTOMER', 'COMPANY', 'ADMIN') NOT NULL DEFAULT 'END_CUSTOMER', \`email_verified_at\` datetime NULL, \`phone_verified_at\` datetime NULL, \`last_login_at\` datetime NULL, \`last_login_ip\` varchar(45) NULL, \`profile_image_url\` varchar(500) NULL, \`locale\` varchar(10) NOT NULL DEFAULT 'de', \`timezone\` varchar(50) NOT NULL DEFAULT 'Europe/Berlin', \`gdpr_consent_at\` datetime NULL, \`gdpr_consent_version\` varchar(20) NOT NULL DEFAULT '1.0', \`data_retention_days\` int UNSIGNED NOT NULL DEFAULT '2555', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, INDEX \`IDX_073999dfec9d14522f0cf58cd6\` (\`deleted_at\`), INDEX \`IDX_ace513fa30d485cfd25c11a9e4\` (\`role\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`team_availability\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`team_id\` int UNSIGNED NOT NULL, \`date\` date NOT NULL, \`is_available\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_bab0997b23abc624894f573934\` (\`date\`), INDEX \`IDX_e106a3932be94d2b0d0ebdab8e\` (\`team_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`request_videos\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`move_request_id\` int UNSIGNED NOT NULL, \`s3_key\` varchar(500) NOT NULL, \`s3_url\` varchar(500) NULL, \`content_type\` varchar(50) NOT NULL DEFAULT 'video/mp4', \`file_size_bytes\` int UNSIGNED NULL, \`uploaded_at\` datetime NOT NULL, \`expires_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3816c72c41de0d8bc4315878c2\` (\`move_request_id\`), UNIQUE INDEX \`REL_3816c72c41de0d8bc4315878c2\` (\`move_request_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`move_request_items\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`move_request_id\` int UNSIGNED NOT NULL, \`name\` varchar(200) NOT NULL, \`quantity\` int UNSIGNED NOT NULL DEFAULT '1', \`volume\` float NULL, \`weight\` float NULL, \`is_ai_detected\` tinyint NOT NULL DEFAULT 0, \`confidence_score\` float NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_2590f3307fb77a8436684207c6\` (\`is_ai_detected\`), INDEX \`IDX_e979380059a2ee35bfd4ea792e\` (\`move_request_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`move_requests\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`user_id\` int UNSIGNED NOT NULL, \`origin_address\` varchar(500) NOT NULL, \`destination_address\` varchar(500) NOT NULL, \`move_date\` date NOT NULL, \`floors_origin\` int NOT NULL DEFAULT '0', \`floors_destination\` int NOT NULL DEFAULT '0', \`elevator\` tinyint NOT NULL DEFAULT 0, \`parking_distance\` int NULL, \`extras\` json NULL, \`status\` enum ('DRAFT', 'VIDEO_UPLOADED', 'AI_PROCESSED', 'READY_FOR_REQUEST', 'SENT_TO_COMPANIES') NOT NULL DEFAULT 'DRAFT', \`sent_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_941eb33fa26b2be1b080df1daa\` (\`move_date\`), INDEX \`IDX_ce7d4abe8c555f499147cd7d2f\` (\`status\`), INDEX \`IDX_bea8fa3c9e04618702997dcab9\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`team_bookings\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`team_id\` int UNSIGNED NOT NULL, \`move_request_id\` int UNSIGNED NOT NULL, \`booking_date\` date NOT NULL, \`status\` enum ('RESERVED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'RESERVED', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_ef97d04ad1679945fbae39d644\` (\`booking_date\`), INDEX \`IDX_c8799262d0614e82048c61d74b\` (\`move_request_id\`), INDEX \`IDX_59b90247a4d7e47b584b95a9ef\` (\`team_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company_teams\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`company_id\` int UNSIGNED NOT NULL, \`name\` varchar(100) NOT NULL, \`max_parallel_jobs\` int UNSIGNED NOT NULL DEFAULT '1', \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_67c3382dd1794cc8218111b986\` (\`company_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reviews\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`move_request_id\` int UNSIGNED NOT NULL, \`company_id\` int UNSIGNED NOT NULL, \`user_id\` int UNSIGNED NOT NULL, \`rating\` int UNSIGNED NOT NULL, \`review_text\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_f4b88c05a7adf404a6e6b2f1eb\` (\`rating\`), INDEX \`IDX_728447781a30bc3fcfe5c2f1cd\` (\`user_id\`), INDEX \`IDX_bcb2d179b57808a093bc971893\` (\`company_id\`), UNIQUE INDEX \`IDX_ee51a37529a02c1b569ff6484a\` (\`move_request_id\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company_pricing\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`company_id\` int UNSIGNED NOT NULL, \`base_fee\` decimal(10,2) NOT NULL, \`price_per_hour\` decimal(10,2) NOT NULL, \`price_per_km\` decimal(10,2) NOT NULL, \`minimum_hours\` int UNSIGNED NOT NULL DEFAULT '2', \`team_size\` int UNSIGNED NOT NULL DEFAULT '2', \`service_prices\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_038b8cb8fb142a3dbfe75efa71\` (\`company_id\`), UNIQUE INDEX \`REL_038b8cb8fb142a3dbfe75efa71\` (\`company_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`offers\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`move_request_id\` int UNSIGNED NOT NULL, \`company_id\` int UNSIGNED NOT NULL, \`price\` decimal(10,2) NOT NULL, \`status\` enum ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT', \`breakdown\` json NULL, \`message\` text NULL, \`team_id\` int UNSIGNED NULL, \`sent_at\` datetime NULL, \`accepted_at\` datetime NULL, \`rejected_at\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_434239966cb60e2dbc6178f993\` (\`status\`), INDEX \`IDX_05123562dd8aada94eea2d2b92\` (\`company_id\`), INDEX \`IDX_358540b662206c872648003ac3\` (\`move_request_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`company_documents\` ADD CONSTRAINT \`FK_43830ec86bb6c8a2f2bc1f2b5f5\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`companies\` ADD CONSTRAINT \`FK_ee0839cba07cb0c52602021ad4b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_availability\` ADD CONSTRAINT \`FK_e106a3932be94d2b0d0ebdab8e8\` FOREIGN KEY (\`team_id\`) REFERENCES \`company_teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`request_videos\` ADD CONSTRAINT \`FK_3816c72c41de0d8bc4315878c23\` FOREIGN KEY (\`move_request_id\`) REFERENCES \`move_requests\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`move_request_items\` ADD CONSTRAINT \`FK_e979380059a2ee35bfd4ea792e2\` FOREIGN KEY (\`move_request_id\`) REFERENCES \`move_requests\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`move_requests\` ADD CONSTRAINT \`FK_bea8fa3c9e04618702997dcab90\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_bookings\` ADD CONSTRAINT \`FK_59b90247a4d7e47b584b95a9ef2\` FOREIGN KEY (\`team_id\`) REFERENCES \`company_teams\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`team_bookings\` ADD CONSTRAINT \`FK_c8799262d0614e82048c61d74bd\` FOREIGN KEY (\`move_request_id\`) REFERENCES \`move_requests\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company_teams\` ADD CONSTRAINT \`FK_67c3382dd1794cc8218111b9863\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_c37908b8d437c18059e04906e63\` FOREIGN KEY (\`move_request_id\`) REFERENCES \`move_requests\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_bcb2d179b57808a093bc971893a\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company_pricing\` ADD CONSTRAINT \`FK_038b8cb8fb142a3dbfe75efa71a\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_358540b662206c872648003ac31\` FOREIGN KEY (\`move_request_id\`) REFERENCES \`move_requests\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`offers\` ADD CONSTRAINT \`FK_05123562dd8aada94eea2d2b92c\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_05123562dd8aada94eea2d2b92c\``);
        await queryRunner.query(`ALTER TABLE \`offers\` DROP FOREIGN KEY \`FK_358540b662206c872648003ac31\``);
        await queryRunner.query(`ALTER TABLE \`company_pricing\` DROP FOREIGN KEY \`FK_038b8cb8fb142a3dbfe75efa71a\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_bcb2d179b57808a093bc971893a\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_c37908b8d437c18059e04906e63\``);
        await queryRunner.query(`ALTER TABLE \`company_teams\` DROP FOREIGN KEY \`FK_67c3382dd1794cc8218111b9863\``);
        await queryRunner.query(`ALTER TABLE \`team_bookings\` DROP FOREIGN KEY \`FK_c8799262d0614e82048c61d74bd\``);
        await queryRunner.query(`ALTER TABLE \`team_bookings\` DROP FOREIGN KEY \`FK_59b90247a4d7e47b584b95a9ef2\``);
        await queryRunner.query(`ALTER TABLE \`move_requests\` DROP FOREIGN KEY \`FK_bea8fa3c9e04618702997dcab90\``);
        await queryRunner.query(`ALTER TABLE \`move_request_items\` DROP FOREIGN KEY \`FK_e979380059a2ee35bfd4ea792e2\``);
        await queryRunner.query(`ALTER TABLE \`request_videos\` DROP FOREIGN KEY \`FK_3816c72c41de0d8bc4315878c23\``);
        await queryRunner.query(`ALTER TABLE \`team_availability\` DROP FOREIGN KEY \`FK_e106a3932be94d2b0d0ebdab8e8\``);
        await queryRunner.query(`ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_ee0839cba07cb0c52602021ad4b\``);
        await queryRunner.query(`ALTER TABLE \`company_documents\` DROP FOREIGN KEY \`FK_43830ec86bb6c8a2f2bc1f2b5f5\``);
        await queryRunner.query(`DROP INDEX \`IDX_358540b662206c872648003ac3\` ON \`offers\``);
        await queryRunner.query(`DROP INDEX \`IDX_05123562dd8aada94eea2d2b92\` ON \`offers\``);
        await queryRunner.query(`DROP INDEX \`IDX_434239966cb60e2dbc6178f993\` ON \`offers\``);
        await queryRunner.query(`DROP TABLE \`offers\``);
        await queryRunner.query(`DROP INDEX \`REL_038b8cb8fb142a3dbfe75efa71\` ON \`company_pricing\``);
        await queryRunner.query(`DROP INDEX \`IDX_038b8cb8fb142a3dbfe75efa71\` ON \`company_pricing\``);
        await queryRunner.query(`DROP TABLE \`company_pricing\``);
        await queryRunner.query(`DROP INDEX \`IDX_ee51a37529a02c1b569ff6484a\` ON \`reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_bcb2d179b57808a093bc971893\` ON \`reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_728447781a30bc3fcfe5c2f1cd\` ON \`reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_f4b88c05a7adf404a6e6b2f1eb\` ON \`reviews\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_67c3382dd1794cc8218111b986\` ON \`company_teams\``);
        await queryRunner.query(`DROP TABLE \`company_teams\``);
        await queryRunner.query(`DROP INDEX \`IDX_59b90247a4d7e47b584b95a9ef\` ON \`team_bookings\``);
        await queryRunner.query(`DROP INDEX \`IDX_c8799262d0614e82048c61d74b\` ON \`team_bookings\``);
        await queryRunner.query(`DROP INDEX \`IDX_ef97d04ad1679945fbae39d644\` ON \`team_bookings\``);
        await queryRunner.query(`DROP TABLE \`team_bookings\``);
        await queryRunner.query(`DROP INDEX \`IDX_bea8fa3c9e04618702997dcab9\` ON \`move_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_ce7d4abe8c555f499147cd7d2f\` ON \`move_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_941eb33fa26b2be1b080df1daa\` ON \`move_requests\``);
        await queryRunner.query(`DROP TABLE \`move_requests\``);
        await queryRunner.query(`DROP INDEX \`IDX_e979380059a2ee35bfd4ea792e\` ON \`move_request_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_2590f3307fb77a8436684207c6\` ON \`move_request_items\``);
        await queryRunner.query(`DROP TABLE \`move_request_items\``);
        await queryRunner.query(`DROP INDEX \`REL_3816c72c41de0d8bc4315878c2\` ON \`request_videos\``);
        await queryRunner.query(`DROP INDEX \`IDX_3816c72c41de0d8bc4315878c2\` ON \`request_videos\``);
        await queryRunner.query(`DROP TABLE \`request_videos\``);
        await queryRunner.query(`DROP INDEX \`IDX_e106a3932be94d2b0d0ebdab8e\` ON \`team_availability\``);
        await queryRunner.query(`DROP INDEX \`IDX_bab0997b23abc624894f573934\` ON \`team_availability\``);
        await queryRunner.query(`DROP TABLE \`team_availability\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_ace513fa30d485cfd25c11a9e4\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_073999dfec9d14522f0cf58cd6\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_ee0839cba07cb0c52602021ad4\` ON \`companies\``);
        await queryRunner.query(`DROP INDEX \`IDX_b28b07d25e4324eee577de5496\` ON \`companies\``);
        await queryRunner.query(`DROP INDEX \`IDX_fa5b148ef2ac03342ed8d9078b\` ON \`companies\``);
        await queryRunner.query(`DROP INDEX \`IDX_3b873f30fa6aaf3578d6a677a3\` ON \`companies\``);
        await queryRunner.query(`DROP TABLE \`companies\``);
        await queryRunner.query(`DROP INDEX \`IDX_43830ec86bb6c8a2f2bc1f2b5f\` ON \`company_documents\``);
        await queryRunner.query(`DROP INDEX \`IDX_d595803a45594d373bcb8c6045\` ON \`company_documents\``);
        await queryRunner.query(`DROP INDEX \`IDX_afefd11563ac4d457c3af03d6e\` ON \`company_documents\``);
        await queryRunner.query(`DROP TABLE \`company_documents\``);
    }

}
