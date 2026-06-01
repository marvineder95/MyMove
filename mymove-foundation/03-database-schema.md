# MyMove Database Schema

> **Platform:** MyMove — Hybrid B2C + B2B SaaS + Marketplace for Moving Services  
> **Database:** MySQL 8.0+  
> **Engine:** InnoDB  
> **Charset:** utf8mb4  
> **Collation:** utf8mb4_unicode_ci  
> **Total Tables:** 21  

---

## Section 1 — Schema Overview

### ASCII ER Diagram

```
+---------------+       +------------------+       +------------------+
|    users      |       |    companies     |       | company_documents|
+---------------+       +------------------+       +------------------+
| id (PK)       |<----->| id (PK)          |<----->| id (PK)          |
| email         |  1:1  | user_id (FK)     |  1:N  | company_id (FK)  |
| role          |       | company_name     |       | document_type    |
| ...           |       | status           |       | status           |
+---------------+       +------------------+       +------------------+
        | 1:N                    | 1:N
        |                        |
        v                        v
+------------------+    +------------------+    +------------------+
|  move_requests   |    |      teams       |    |  team_members    |
+------------------+    +------------------+    +------------------+
| id (PK)          |    | id (PK)          |<---| team_id (FK)     |
| user_id (FK)     |    | company_id (FK)  | 1:N| ...              |
| video_id (FK)    |    | team_name        |    +------------------+
| ai_analysis_id   |    | max_jobs_per_day |
| status           |    +------------------+
| job_status       |           | 1:N
+------------------+           v
        | 1:N           +------------------+
        |               | availability_slots
        v               +------------------+
+------------------+    | id (PK)          |
|     videos       |    | team_id (FK)   |
+------------------+    | slot_date        |
| id (PK)          |    | capacity_used    |
| user_id (FK)     |    | capacity_total   |
| s3_key           |    +------------------+
| retention_until  |
+------------------+
        | 1:1
        v
+------------------+    +------------------+    +------------------+
|   ai_analyses    |    |  inventory_items |    |  pricing_rules   |
+------------------+    +------------------+    +------------------+
| id (PK)          |    | id (PK)          |    | id (PK)          |
| video_id (FK)    |    | move_request_id  |    | company_id (FK)  |
| detected_items   |    | item_name        |    | price_per_hour   |
| total_volume_m3  |    | is_ai_detected   |    | price_per_km     |
| confidence_score |    | confidence_score |    | base_fee         |
+------------------+    +------------------+    +------------------+
                              ^ 1:N
                              |
+------------------+    +------------------+    +------------------+
| request_companies |   |     offers       |<---|  offer_services  |
+------------------+    +------------------+    +------------------+
| id (PK)          |    | id (PK)          | 1:N| id (PK)          |
| move_request_id  |--->| move_request_id  |    | offer_id (FK)    |
| company_id (FK)  | N:M| company_id (FK)  |    | service_addon_id |
| team_id (FK)     |    | team_id (FK)     |    | quantity         |
| status           |    | total_price      |    | total_price      |
+------------------+    | status           |    +------------------+
                        +------------------+           ^
                               | 1:1                      |
                               v                          | 1:N
                        +------------------+    +------------------+
                        |     reviews      |    |  service_addons  |
                        +------------------+    +------------------+
                        | id (PK)          |    | id (PK)          |
                        | move_request_id  |    | company_id (FK)  |
                        | offer_id (FK)    |    | service_name     |
                        | company_id (FK)  |    | price            |
                        | score            |    | pricing_type     |
                        | review_text      |    +------------------+
                        +------------------+
                               | 1:1
                               v
                        +------------------+
                        |   commissions    |
                        +------------------+
                        | id (PK)          |
                        | move_request_id  |
                        | offer_id (FK)    |
                        | company_id (FK)  |
                        | commission_amount|
                        +------------------+

+------------------+    +------------------+    +------------------+
|  notifications   |    |   admin_logs     |    | company_invites  |
+------------------+    +------------------+    +------------------+
| id (PK)          |    | id (PK)          |    | id (PK)          |
| user_id (FK)     |    | admin_user_id    |    | company_id (FK)  |
| type             |    | action_type      |    | invited_email    |
| title            |    | target_table     |    | invite_token     |
| is_read          |    | old_values_json  |    | status           |
+------------------+    +------------------+    +------------------+
```

### Table Count & Naming Convention Summary

| #  | Table Name          | Purpose                                 | Soft Delete |
|----|---------------------|-----------------------------------------|-------------|
| 1  | `users`             | All platform users (RBAC)               | Yes         |
| 2  | `companies`         | Company profiles                        | Yes         |
| 3  | `company_documents` | KYC/verification documents                | Yes         |
| 4  | `teams`             | Moving teams per company                | No          |
| 5  | `team_members`      | Workers assigned to teams               | Yes         |
| 6  | `availability_slots`| Daily capacity calendar per team        | No          |
| 7  | `move_requests`     | Customer move requests                    | Yes         |
| 8  | `videos`            | S3 video metadata (temporary)             | No*         |
| 9  | `ai_analyses`       | AI inventory analysis results            | No          |
| 10 | `inventory_items`   | Detected + user-edited items            | Yes         |
| 11 | `pricing_rules`     | Company pricing configurations          | No          |
| 12 | `service_addons`    | Extra services offered by companies     | Yes         |
| 13 | `offers`            | Company offers to customers             | Yes         |
| 14 | `offer_services`    | Services attached to an offer           | No          |
| 15 | `reviews`           | Customer ratings & reviews              | Yes         |
| 16 | `commissions`       | Commission records per completed job    | No          |
| 17 | `notifications`     | Platform notifications                  | No          |
| 18 | `admin_logs`        | Admin audit trail (immutable)           | No          |
| 19 | `company_invites`   | SaaS invites (company -> customer)       | Yes         |
| 20 | `request_companies` | Marketplace: companies requested per move | No          |
| 21 | `addresses`         | Normalized address storage (optional)   | Yes         |

*Videos use `is_deleted` + `retention_until` for automated lifecycle management.

**Naming Conventions Applied:**
- Table names: `snake_case` plural (`users`, `move_requests`)
- Column names: `snake_case` (`first_name`, `price_per_hour`)
- Primary keys: `id` — `BIGINT UNSIGNED AUTO_INCREMENT`
- Foreign keys: `{table}_id` format (`user_id`, `company_id`, `move_request_id`)
- Timestamps: `created_at`, `updated_at` on every table
- Soft delete: `deleted_at DATETIME NULL` for privacy-sensitive tables
- Monetary values: `DECIMAL(10,2)`
- Flexible arrays: `JSON` type

---

## Section 2 — Complete SQL DDL


### 2.1 `users` — All platform users (RBAC)

```sql
CREATE TABLE users (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email                 VARCHAR(255) NOT NULL,
  password_hash         VARCHAR(255) NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  phone                 VARCHAR(50),
  role                  VARCHAR(30) NOT NULL COMMENT 'END_CUSTOMER, COMPANY, ADMIN',
  email_verified_at     DATETIME,
  phone_verified_at     DATETIME,
  last_login_at         DATETIME,
  last_login_ip         VARCHAR(45),
  profile_image_url     VARCHAR(500),
  locale                VARCHAR(10) DEFAULT 'de',
  timezone              VARCHAR(50) DEFAULT 'Europe/Berlin',
  gdpr_consent_at       DATETIME COMMENT 'Timestamp of GDPR consent',
  gdpr_consent_version  VARCHAR(20) DEFAULT '1.0',
  data_retention_days   INT UNSIGNED DEFAULT 2555 COMMENT '7 years default for tax/legal',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT chk_users_role CHECK (role IN ('END_CUSTOMER', 'COMPANY', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='All platform users with unified authentication and RBAC';

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_phone ON users(phone);
```

---

### 2.2 `companies` — Company profiles

```sql
CREATE TABLE companies (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL COMMENT 'Owner/admin user of the company',
  company_name          VARCHAR(200) NOT NULL,
  slug                  VARCHAR(200) NOT NULL COMMENT 'URL-friendly identifier',
  description           TEXT,
  logo_url              VARCHAR(500),
  website               VARCHAR(255),
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  tax_id                VARCHAR(50) COMMENT 'VAT / tax identification number',
  registration_number   VARCHAR(100) COMMENT 'Commercial register number',
  service_area_type     VARCHAR(20) DEFAULT 'ZIP_CODES' COMMENT 'ZIP_CODES or REGIONS',
  service_area_data     JSON COMMENT 'Array of zip codes or region polygons',
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED, SUSPENDED',
  avg_rating            DECIMAL(2,1) DEFAULT 0.0 COMMENT 'Cached average rating (1-5)',
  total_reviews         INT UNSIGNED DEFAULT 0 COMMENT 'Cached review count',
  commission_rate       DECIMAL(5,2) DEFAULT 10.00 COMMENT 'Percentage commission (dynamic by rating)',
  subscription_status   VARCHAR(20) DEFAULT 'INACTIVE' COMMENT 'INACTIVE, ACTIVE, TRIAL, EXPIRED (SaaS white-label)',
  subscription_plan     VARCHAR(50) COMMENT 'Basic, Pro, Enterprise',
  subscription_expires_at DATETIME,
  is_verified           BOOLEAN DEFAULT FALSE,
  verified_at           DATETIME,
  suspended_reason      VARCHAR(255),
  suspended_at          DATETIME,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_companies_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_companies_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  CONSTRAINT chk_companies_subscription_status CHECK (subscription_status IN ('INACTIVE', 'ACTIVE', 'TRIAL', 'EXPIRED')),
  CONSTRAINT chk_companies_service_area_type CHECK (service_area_type IN ('ZIP_CODES', 'REGIONS'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Company profiles with verification status and SaaS subscription';

CREATE UNIQUE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_avg_rating ON companies(avg_rating);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);
```

---

### 2.3 `company_documents` — KYC / verification documents

```sql
CREATE TABLE company_documents (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id            BIGINT UNSIGNED NOT NULL,
  document_type         VARCHAR(30) NOT NULL COMMENT 'TRADE_LICENSE, INSURANCE, OTHER',
  file_url              VARCHAR(500) NOT NULL COMMENT 'S3 or storage URL',
  file_name             VARCHAR(255) NOT NULL,
  file_size_bytes       INT UNSIGNED,
  mime_type             VARCHAR(100),
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, VERIFIED, REJECTED',
  reviewed_by           BIGINT UNSIGNED COMMENT 'Admin user who reviewed',
  reviewed_at           DATETIME,
  rejection_reason      TEXT,
  expiry_date           DATETIME COMMENT 'For insurance documents with expiration',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_company_documents_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_company_documents_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_company_documents_type CHECK (document_type IN ('TRADE_LICENSE', 'INSURANCE', 'OTHER')),
  CONSTRAINT chk_company_documents_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Uploaded company documents for admin verification (KYC)';

CREATE INDEX idx_company_documents_company_id ON company_documents(company_id);
CREATE INDEX idx_company_documents_status ON company_documents(status);
CREATE INDEX idx_company_documents_type ON company_documents(document_type);
CREATE INDEX idx_company_documents_deleted_at ON company_documents(deleted_at);
```

---

### 2.4 `teams` — Moving teams within a company

```sql
CREATE TABLE teams (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id            BIGINT UNSIGNED NOT NULL,
  team_name             VARCHAR(100) NOT NULL COMMENT 'e.g., Team Alpha, Team North',
  color_code            VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Hex color for calendar display',
  max_jobs_per_day      INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Maximum parallel moves per day',
  default_start_hour    TIME DEFAULT '08:00:00' COMMENT 'Typical shift start',
  default_end_hour      TIME DEFAULT '17:00:00' COMMENT 'Typical shift end',
  is_active             BOOLEAN DEFAULT TRUE,
  notes                 TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_teams_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Moving teams with daily capacity for scheduling';

CREATE INDEX idx_teams_company_id ON teams(company_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);
```

---

### 2.5 `team_members` — Workers in a team

```sql
CREATE TABLE team_members (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id               BIGINT UNSIGNED NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  phone                 VARCHAR(50),
  email                 VARCHAR(255),
  role_in_team          VARCHAR(30) DEFAULT 'MOVER' COMMENT 'DRIVER, MOVER, TEAM_LEAD, HELPER',
  is_active             BOOLEAN DEFAULT TRUE,
  joined_at             DATETIME,
  left_at               DATETIME,
  emergency_contact     VARCHAR(100),
  emergency_phone       VARCHAR(50),
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_team_members_team_id
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_team_members_role CHECK (role_in_team IN ('DRIVER', 'MOVER', 'TEAM_LEAD', 'HELPER'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Individual workers assigned to moving teams';

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
CREATE INDEX idx_team_members_deleted_at ON team_members(deleted_at);
```

---

### 2.6 `availability_slots` — Calendar capacity per team per day

```sql
CREATE TABLE availability_slots (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  team_id               BIGINT UNSIGNED NOT NULL,
  slot_date             DATE NOT NULL,
  capacity_used         INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Jobs already assigned',
  capacity_total        INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Max jobs for this team on this date',
  is_blocked            BOOLEAN DEFAULT FALSE COMMENT 'Manually blocked (holiday, maintenance)',
  blocked_reason        VARCHAR(255),
  notes                 TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_availability_slots_team_id
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_availability_slots_capacity CHECK (capacity_used <= capacity_total)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Daily capacity tracking for team scheduling';

CREATE UNIQUE INDEX idx_availability_slots_team_date ON availability_slots(team_id, slot_date);
CREATE INDEX idx_availability_slots_date ON availability_slots(slot_date);
CREATE INDEX idx_availability_slots_is_blocked ON availability_slots(is_blocked);
```

---

### 2.7 `move_requests` — Customer move requests

```sql
CREATE TABLE move_requests (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL COMMENT 'Customer who created the request',
  request_number        VARCHAR(50) NOT NULL COMMENT 'Human-readable ID e.g., MOV-2024-000123',
  from_address          JSON NOT NULL COMMENT 'Structured address object',
  to_address            JSON NOT NULL COMMENT 'Structured address object',
  move_date             DATE NOT NULL,
  preferred_time_start  TIME,
  preferred_time_end    TIME,
  from_floor            INT DEFAULT 0 COMMENT 'Ground floor = 0',
  to_floor              INT DEFAULT 0,
  elevator_type         VARCHAR(20) DEFAULT 'NONE' COMMENT 'NONE, SMALL, LARGE, GOODS',
  parking_situation     VARCHAR(20) DEFAULT 'EASY' COMMENT 'EASY, MODERATE, DIFFICULT, NO_PARKING',
  distance_to_truck_meters INT UNSIGNED COMMENT 'Walking distance from door to truck',
  estimated_distance_km DECIMAL(8,2) COMMENT 'Route distance from-to address',
  extras_json           JSON COMMENT 'Additional requirements (packing, storage, etc.)',
  customer_notes        TEXT,
  status                VARCHAR(30) NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT, SUBMITTED, OFFERS_PENDING, OFFER_RECEIVED, ACCEPTED, COMPLETED, CANCELLED',
  job_status            VARCHAR(30) COMMENT 'SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED',
  video_id              BIGINT UNSIGNED COMMENT 'Linked video (temporary)',
  ai_analysis_id        BIGINT UNSIGNED COMMENT 'Linked AI analysis results',
  accepted_offer_id     BIGINT UNSIGNED COMMENT 'FK to the accepted offer',
  completed_at          DATETIME,
  cancelled_at          DATETIME,
  cancellation_reason   VARCHAR(255),
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_move_requests_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_move_requests_video_id
    FOREIGN KEY (video_id) REFERENCES videos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_move_requests_ai_analysis_id
    FOREIGN KEY (ai_analysis_id) REFERENCES ai_analyses(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_move_requests_accepted_offer_id
    FOREIGN KEY (accepted_offer_id) REFERENCES offers(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_move_requests_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'OFFERS_PENDING', 'OFFER_RECEIVED', 'ACCEPTED', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT chk_move_requests_job_status CHECK (job_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT chk_move_requests_elevator CHECK (elevator_type IN ('NONE', 'SMALL', 'LARGE', 'GOODS')),
  CONSTRAINT chk_move_requests_parking CHECK (parking_situation IN ('EASY', 'MODERATE', 'DIFFICULT', 'NO_PARKING'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Core move request created by end customers';

CREATE UNIQUE INDEX idx_move_requests_number ON move_requests(request_number);
CREATE INDEX idx_move_requests_user_id ON move_requests(user_id);
CREATE INDEX idx_move_requests_status ON move_requests(status);
CREATE INDEX idx_move_requests_move_date ON move_requests(move_date);
CREATE INDEX idx_move_requests_job_status ON move_requests(job_status);
CREATE INDEX idx_move_requests_user_status ON move_requests(user_id, status);
CREATE INDEX idx_move_requests_deleted_at ON move_requests(deleted_at);
```

---

### 2.8 `videos` — S3 video metadata (temporary, GDPR)

```sql
CREATE TABLE videos (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL,
  move_request_id       BIGINT UNSIGNED,
  s3_bucket             VARCHAR(100) NOT NULL,
  s3_key                VARCHAR(500) NOT NULL,
  s3_url                VARCHAR(500) COMMENT 'Pre-signed or public URL',
  file_size_bytes       BIGINT UNSIGNED,
  mime_type             VARCHAR(100),
  duration_seconds      DECIMAL(8,2),
  resolution_width      INT UNSIGNED,
  resolution_height     INT UNSIGNED,
  thumbnail_s3_key      VARCHAR(500),
  processing_status     VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, PROCESSING, PROCESSED, FAILED',
  retention_until       DATETIME NOT NULL COMMENT 'Auto-delete timestamp (max 30 days)',
  is_deleted            BOOLEAN DEFAULT FALSE COMMENT 'Soft-flag for S3 lifecycle',
  deleted_reason        VARCHAR(50) COMMENT 'EXPIRED, OFFER_SENT, USER_DELETED, ADMIN_PURGED',
  deleted_at            DATETIME,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_videos_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_videos_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_videos_processing_status CHECK (processing_status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Video upload metadata with automatic retention management';

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_move_request_id ON videos(move_request_id);
CREATE INDEX idx_videos_retention_until ON videos(retention_until);
CREATE INDEX idx_videos_is_deleted ON videos(is_deleted);
CREATE INDEX idx_videos_processing_status ON videos(processing_status);
```

---

### 2.9 `ai_analyses` — AI results from video processing

```sql
CREATE TABLE ai_analyses (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  video_id              BIGINT UNSIGNED NOT NULL,
  move_request_id       BIGINT UNSIGNED,
  detected_items_json   JSON NOT NULL COMMENT 'Array of detected items with categories',
  total_volume_m3       DECIMAL(8,3) COMMENT 'Estimated total volume in cubic meters',
  estimated_weight_kg   DECIMAL(10,2) COMMENT 'Estimated total weight in kg',
  confidence_score      DECIMAL(3,2) COMMENT 'Overall AI confidence (0.00 - 1.00)',
  processing_status     VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, PROCESSING, COMPLETED, FAILED',
  processed_at          DATETIME,
  processing_duration_ms INT UNSIGNED COMMENT 'Time taken to process',
  raw_response_json     JSON COMMENT 'Full raw AI API response for debugging',
  model_version         VARCHAR(50) COMMENT 'AI model version used',
  error_message         TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ai_analyses_video_id
    FOREIGN KEY (video_id) REFERENCES videos(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ai_analyses_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_ai_analyses_processing_status CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='AI inventory analysis results from uploaded videos';

CREATE INDEX idx_ai_analyses_video_id ON ai_analyses(video_id);
CREATE INDEX idx_ai_analyses_move_request_id ON ai_analyses(move_request_id);
CREATE INDEX idx_ai_analyses_processing_status ON ai_analyses(processing_status);
```

---

### 2.10 `inventory_items` — Detected + user-edited items

```sql
CREATE TABLE inventory_items (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  move_request_id       BIGINT UNSIGNED NOT NULL,
  ai_analysis_id        BIGINT UNSIGNED COMMENT 'FK to AI detection if AI-generated',
  item_name             VARCHAR(200) NOT NULL COMMENT 'e.g., Sofa, Refrigerator, Box of Books',
  category              VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'FURNITURE, APPLIANCE, BOX, FRAGILE, GENERAL',
  quantity              INT UNSIGNED NOT NULL DEFAULT 1,
  volume_m3             DECIMAL(8,4) COMMENT 'Per-item volume',
  weight_kg             DECIMAL(8,2) COMMENT 'Per-item weight',
  dimensions_cm         VARCHAR(50) COMMENT 'LxWxH string e.g., 200x90x80',
  is_ai_detected        BOOLEAN DEFAULT FALSE COMMENT 'True if detected by AI, false if user-added',
  confidence_score      DECIMAL(3,2) COMMENT 'AI confidence for this item (0.00 - 1.00)',
  user_notes            VARCHAR(255),
  sort_order            INT UNSIGNED DEFAULT 0,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_inventory_items_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_items_ai_analysis_id
    FOREIGN KEY (ai_analysis_id) REFERENCES ai_analyses(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_inventory_items_category CHECK (category IN ('FURNITURE', 'APPLIANCE', 'BOX', 'FRAGILE', 'GENERAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Individual inventory items for a move request';

CREATE INDEX idx_inventory_items_move_request_id ON inventory_items(move_request_id);
CREATE INDEX idx_inventory_items_ai_analysis_id ON inventory_items(ai_analysis_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_deleted_at ON inventory_items(deleted_at);
```


---

### 2.11 `pricing_rules` — Company pricing configurations

```sql
CREATE TABLE pricing_rules (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id            BIGINT UNSIGNED NOT NULL,
  rule_name             VARCHAR(100) DEFAULT 'Default' COMMENT 'e.g., Standard, Weekend, Holiday',
  price_per_hour        DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Hourly rate in EUR',
  price_per_km          DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Per-kilometer rate in EUR',
  base_fee              DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Flat base fee per move',
  team_size             INT UNSIGNED NOT NULL DEFAULT 2 COMMENT 'Number of workers this pricing applies to',
  min_hours             DECIMAL(4,1) NOT NULL DEFAULT 2.0 COMMENT 'Minimum billable hours',
  weekend_multiplier    DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Multiplier for Saturday/Sunday',
  holiday_multiplier    DECIMAL(3,2) DEFAULT 1.50 COMMENT 'Multiplier for public holidays',
  service_prices_json   JSON COMMENT 'Custom per-service overrides {service_id: price}',
  is_default            BOOLEAN DEFAULT FALSE COMMENT 'True if this is the company default rule',
  is_active             BOOLEAN DEFAULT TRUE,
  valid_from            DATE,
  valid_until           DATE,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_pricing_rules_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Company-specific pricing rules and multipliers';

CREATE INDEX idx_pricing_rules_company_id ON pricing_rules(company_id);
CREATE INDEX idx_pricing_rules_is_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_is_default ON pricing_rules(is_default);
```

---

### 2.12 `service_addons` — Extra services offered by companies

```sql
CREATE TABLE service_addons (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id            BIGINT UNSIGNED NOT NULL,
  service_name          VARCHAR(100) NOT NULL COMMENT 'e.g., Furniture Assembly, Packing Service',
  description           TEXT,
  price                 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  pricing_type          VARCHAR(20) DEFAULT 'FIXED' COMMENT 'FIXED, PER_HOUR, PER_ITEM, PER_KM, PER_M3',
  min_quantity          DECIMAL(8,2) DEFAULT 1.00,
  max_quantity          DECIMAL(8,2),
  is_active             BOOLEAN DEFAULT TRUE,
  sort_order            INT UNSIGNED DEFAULT 0,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_service_addons_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_service_addons_pricing_type CHECK (pricing_type IN ('FIXED', 'PER_HOUR', 'PER_ITEM', 'PER_KM', 'PER_M3'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Extra services that companies can attach to offers';

CREATE INDEX idx_service_addons_company_id ON service_addons(company_id);
CREATE INDEX idx_service_addons_is_active ON service_addons(is_active);
CREATE INDEX idx_service_addons_deleted_at ON service_addons(deleted_at);
```

---

### 2.13 `offers` — Company offers to customers

```sql
CREATE TABLE offers (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  move_request_id       BIGINT UNSIGNED NOT NULL,
  company_id            BIGINT UNSIGNED NOT NULL,
  team_id               BIGINT UNSIGNED COMMENT 'Assigned team if offer accepted',
  pricing_rule_id       BIGINT UNSIGNED COMMENT 'Pricing rule used for calculation',
  offer_number          VARCHAR(50) NOT NULL COMMENT 'Human-readable offer ID e.g., OFF-2024-000456',
  base_price            DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Calculated base price',
  services_price        DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of add-on services',
  discount_amount       DECIMAL(10,2) DEFAULT 0.00,
  discount_reason       VARCHAR(255),
  total_price           DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Final total including discounts',
  estimated_hours       DECIMAL(5,2) COMMENT 'Estimated duration in hours',
  estimated_distance_km DECIMAL(8,2) COMMENT 'Estimated route distance',
  estimated_volume_m3   DECIMAL(8,3) COMMENT 'Volume used for calculation',
  notes                 TEXT COMMENT 'Company notes to customer',
  internal_notes        TEXT COMMENT 'Internal company-only notes',
  status                VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED',
  expires_at            DATETIME COMMENT 'Offer expiration timestamp',
  sent_at               DATETIME,
  accepted_at           DATETIME,
  rejected_at           DATETIME,
  rejected_reason       VARCHAR(255),
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_offers_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_offers_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_offers_team_id
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_offers_pricing_rule_id
    FOREIGN KEY (pricing_rule_id) REFERENCES pricing_rules(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_offers_status CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Offers sent by companies to customers for move requests';

CREATE UNIQUE INDEX idx_offers_number ON offers(offer_number);
CREATE INDEX idx_offers_move_request_id ON offers(move_request_id);
CREATE INDEX idx_offers_company_id ON offers(company_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_move_company ON offers(move_request_id, company_id);
CREATE INDEX idx_offers_deleted_at ON offers(deleted_at);
```

---

### 2.14 `offer_services` — Services attached to an offer

```sql
CREATE TABLE offer_services (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id              BIGINT UNSIGNED NOT NULL,
  service_addon_id      BIGINT UNSIGNED NOT NULL,
  quantity              DECIMAL(8,2) NOT NULL DEFAULT 1.00,
  unit_price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  company_notes         VARCHAR(255) COMMENT 'Per-service note e.g., includes 3 shelves',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_offer_services_offer_id
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_offer_services_service_addon_id
    FOREIGN KEY (service_addon_id) REFERENCES service_addons(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Junction table linking services to specific offers';

CREATE INDEX idx_offer_services_offer_id ON offer_services(offer_id);
CREATE INDEX idx_offer_services_service_addon_id ON offer_services(service_addon_id);
```

---

### 2.15 `reviews` — Customer ratings and reviews

```sql
CREATE TABLE reviews (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  move_request_id       BIGINT UNSIGNED NOT NULL,
  offer_id              BIGINT UNSIGNED NOT NULL COMMENT 'The accepted offer being reviewed',
  reviewer_user_id      BIGINT UNSIGNED NOT NULL COMMENT 'Customer who wrote the review',
  company_id            BIGINT UNSIGNED NOT NULL COMMENT 'Company being reviewed',
  score                 TINYINT UNSIGNED NOT NULL COMMENT '1-5 star rating',
  review_text           TEXT,
  is_verified           BOOLEAN DEFAULT FALSE COMMENT 'True if move was completed (verified purchase)',
  is_public             BOOLEAN DEFAULT TRUE,
  admin_moderation_status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED, FLAGGED',
  admin_moderation_note TEXT,
  moderation_at         DATETIME,
  moderated_by          BIGINT UNSIGNED,
  company_response      TEXT COMMENT 'Company reply to review',
  company_responded_at  DATETIME,
  helpful_count         INT UNSIGNED DEFAULT 0,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_reviews_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_offer_id
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_reviewer_user_id
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_moderated_by
    FOREIGN KEY (moderated_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_reviews_score CHECK (score BETWEEN 1 AND 5),
  CONSTRAINT chk_reviews_moderation_status CHECK (admin_moderation_status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Customer reviews linked to completed moves and accepted offers';

CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_reviewer_user_id ON reviews(reviewer_user_id);
CREATE INDEX idx_reviews_move_request_id ON reviews(move_request_id);
CREATE INDEX idx_reviews_score ON reviews(score);
CREATE INDEX idx_reviews_company_score ON reviews(company_id, score);
CREATE INDEX idx_reviews_moderation_status ON reviews(admin_moderation_status);
CREATE INDEX idx_reviews_deleted_at ON reviews(deleted_at);
```

---

### 2.16 `commissions` — Commission records per completed job

```sql
CREATE TABLE commissions (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  move_request_id       BIGINT UNSIGNED NOT NULL,
  offer_id              BIGINT UNSIGNED NOT NULL,
  company_id            BIGINT UNSIGNED NOT NULL,
  commission_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  commission_rate       DECIMAL(5,2) NOT NULL DEFAULT 10.00 COMMENT 'Percentage applied at time of completion',
  commission_type       VARCHAR(20) DEFAULT 'PERCENTAGE' COMMENT 'PERCENTAGE, FIXED, TIERED',
  subtotal_amount       DECIMAL(10,2) NOT NULL COMMENT 'Offer total before commission',
  platform_fee_amount   DECIMAL(10,2) DEFAULT 0.00,
  payout_amount         DECIMAL(10,2) NOT NULL COMMENT 'Amount company receives (subtotal - commission)',
  is_paid               BOOLEAN DEFAULT FALSE COMMENT 'True if platform has received payment',
  paid_at               DATETIME,
  payout_to_company_at  DATETIME COMMENT 'When company was paid out',
  invoice_number        VARCHAR(100),
  invoice_url           VARCHAR(500),
  notes                 TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_commissions_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_commissions_offer_id
    FOREIGN KEY (offer_id) REFERENCES offers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_commissions_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_commissions_type CHECK (commission_type IN ('PERCENTAGE', 'FIXED', 'TIERED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Commission records per completed move with payout tracking';

CREATE INDEX idx_commissions_company_id ON commissions(company_id);
CREATE INDEX idx_commissions_move_request_id ON commissions(move_request_id);
CREATE INDEX idx_commissions_offer_id ON commissions(offer_id);
CREATE INDEX idx_commissions_is_paid ON commissions(is_paid);
CREATE INDEX idx_commissions_payout_at ON commissions(payout_to_company_at);
```

---

### 2.17 `notifications` — Platform notifications

```sql
CREATE TABLE notifications (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED NOT NULL COMMENT 'Recipient user',
  notification_type     VARCHAR(50) NOT NULL COMMENT 'OFFER_RECEIVED, OFFER_ACCEPTED, MOVE_REMINDER, DOCUMENT_VERIFIED, SYSTEM, etc.',
  title                 VARCHAR(200) NOT NULL,
  body                  TEXT,
  data_json             JSON COMMENT 'Payload for deep-linking and display context',
  is_read               BOOLEAN DEFAULT FALSE,
  read_at               DATETIME,
  action_url            VARCHAR(500) COMMENT 'Frontend deep link or URL',
  sent_via              VARCHAR(20) DEFAULT 'IN_APP' COMMENT 'IN_APP, EMAIL, SMS, PUSH',
  external_message_id   VARCHAR(100) COMMENT 'Provider message ID for tracking',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_notifications_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_notifications_sent_via CHECK (sent_via IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='User notification inbox with multi-channel delivery tracking';

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

### 2.18 `admin_logs` — Admin audit trail (immutable)

```sql
CREATE TABLE admin_logs (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id         BIGINT UNSIGNED NOT NULL,
  action_type           VARCHAR(50) NOT NULL COMMENT 'COMPANY_APPROVE, COMPANY_REJECT, COMPANY_SUSPEND, DOCUMENT_VERIFY, PRICING_UPDATE, etc.',
  target_table          VARCHAR(50) NOT NULL COMMENT 'Table name being modified',
  target_id             BIGINT UNSIGNED NOT NULL COMMENT 'Primary key of the affected record',
  target_display        VARCHAR(200) COMMENT 'Human-readable identifier e.g., company name',
  old_values_json       JSON COMMENT 'Snapshot of previous values',
  new_values_json       JSON COMMENT 'Snapshot of new values',
  ip_address            VARCHAR(45),
  user_agent            VARCHAR(500),
  request_id            VARCHAR(100) COMMENT 'Correlation ID for tracing',
  severity              VARCHAR(10) DEFAULT 'INFO' COMMENT 'INFO, WARNING, CRITICAL',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_admin_logs_admin_user_id
    FOREIGN KEY (admin_user_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_admin_logs_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Immutable audit trail for all admin actions';

CREATE INDEX idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_table, target_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_severity ON admin_logs(severity);
```

---

### 2.19 `company_invites` — SaaS mode: company invites own customers

```sql
CREATE TABLE company_invites (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id            BIGINT UNSIGNED NOT NULL,
  invited_email         VARCHAR(255) NOT NULL,
  invited_phone         VARCHAR(50),
  invite_token          VARCHAR(100) NOT NULL COMMENT 'Unique token for invitation link',
  status                VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, ACCEPTED, EXPIRED, REVOKED',
  invited_user_id       BIGINT UNSIGNED COMMENT 'Linked user after acceptance',
  custom_message        TEXT,
  expires_at            DATETIME NOT NULL,
  accepted_at           DATETIME,
  revoked_at            DATETIME,
  revoked_by            BIGINT UNSIGNED,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_company_invites_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_company_invites_invited_user_id
    FOREIGN KEY (invited_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_company_invites_revoked_by
    FOREIGN KEY (revoked_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_company_invites_status CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='SaaS white-label: companies invite their own customers directly';

CREATE UNIQUE INDEX idx_company_invites_token ON company_invites(invite_token);
CREATE INDEX idx_company_invites_company_id ON company_invites(company_id);
CREATE INDEX idx_company_invites_status ON company_invites(status);
CREATE INDEX idx_company_invites_email ON company_invites(invited_email);
CREATE INDEX idx_company_invites_deleted_at ON company_invites(deleted_at);
```

---

### 2.20 `request_companies` — Marketplace: companies requested per move

```sql
CREATE TABLE request_companies (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  move_request_id       BIGINT UNSIGNED NOT NULL,
  company_id            BIGINT UNSIGNED NOT NULL,
  team_id               BIGINT UNSIGNED COMMENT 'Pre-assigned or preferred team',
  status                VARCHAR(20) DEFAULT 'REQUESTED' COMMENT 'REQUESTED, VIEWED, DECLINED, OFFERED, EXPIRED',
  requested_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  viewed_at             DATETIME,
  responded_at          DATETIME,
  decline_reason        VARCHAR(255),
  company_notes         TEXT COMMENT 'Internal notes from company',
  notification_sent     BOOLEAN DEFAULT FALSE,
  is_auto_matched       BOOLEAN DEFAULT FALSE COMMENT 'True if auto-matched by system, false if customer-selected',
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_request_companies_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_request_companies_company_id
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_request_companies_team_id
    FOREIGN KEY (team_id) REFERENCES teams(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_request_companies_status CHECK (status IN ('REQUESTED', 'VIEWED', 'DECLINED', 'OFFERED', 'EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Marketplace junction: which companies were requested for each move';

CREATE UNIQUE INDEX idx_request_companies_unique ON request_companies(move_request_id, company_id);
CREATE INDEX idx_request_companies_company_id ON request_companies(company_id);
CREATE INDEX idx_request_companies_status ON request_companies(status);
CREATE INDEX idx_request_companies_team_id ON request_companies(team_id);
```

---

### 2.21 `addresses` — Normalized address storage (optional enhancement)

```sql
CREATE TABLE addresses (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               BIGINT UNSIGNED COMMENT 'Optional: address book entry for user',
  move_request_id       BIGINT UNSIGNED COMMENT 'Optional: linked to move request',
  address_type          VARCHAR(20) NOT NULL COMMENT 'FROM, TO, BILLING, COMPANY',
  label                 VARCHAR(50) COMMENT 'e.g., Home, Office, Parents House',
  street                VARCHAR(255) NOT NULL,
  street_number         VARCHAR(20),
  address_line_2        VARCHAR(100),
  postal_code           VARCHAR(20) NOT NULL,
  city                  VARCHAR(100) NOT NULL,
  state                 VARCHAR(100),
  country               VARCHAR(2) DEFAULT 'DE' COMMENT 'ISO 3166-1 alpha-2',
  latitude              DECIMAL(10,8) COMMENT 'GPS for distance calculation',
  longitude             DECIMAL(11,8) COMMENT 'GPS for distance calculation',
  floor                 INT DEFAULT 0,
  has_elevator          BOOLEAN DEFAULT FALSE,
  elevator_type         VARCHAR(20) DEFAULT 'NONE',
  parking_situation     VARCHAR(20) DEFAULT 'EASY',
  building_type         VARCHAR(50) COMMENT 'APARTMENT, HOUSE, OFFICE, STORAGE',
  access_notes          TEXT COMMENT 'Ring bell, gate code, etc.',
  is_default            BOOLEAN DEFAULT FALSE,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME NULL,

  CONSTRAINT fk_addresses_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_addresses_move_request_id
    FOREIGN KEY (move_request_id) REFERENCES move_requests(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_addresses_address_type CHECK (address_type IN ('FROM', 'TO', 'BILLING', 'COMPANY')),
  CONSTRAINT chk_addresses_elevator CHECK (elevator_type IN ('NONE', 'SMALL', 'LARGE', 'GOODS')),
  CONSTRAINT chk_addresses_parking CHECK (parking_situation IN ('EASY', 'MODERATE', 'DIFFICULT', 'NO_PARKING'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Normalized address storage for reuse and geo-querying';

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_move_request_id ON addresses(move_request_id);
CREATE INDEX idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_address_type ON addresses(address_type);
CREATE INDEX idx_addresses_deleted_at ON addresses(deleted_at);
```


---

## Section 3 — Enum Definitions

All enum values are enforced via `CHECK` constraints (MySQL 8.0.16+) for referential integrity without extra join overhead.

### 3.1 `user_role`

| Value          | Description                          |
|----------------|--------------------------------------|
| `END_CUSTOMER` | Individual moving customer             |
| `COMPANY`      | Moving company owner / manager         |
| `ADMIN`        | Platform administrator (point4Studio)|

**Constraint:** `chk_users_role CHECK (role IN ('END_CUSTOMER', 'COMPANY', 'ADMIN'))`

---

### 3.2 `company_status`

| Value       | Description                                    |
|-------------|------------------------------------------------|
| `PENDING`   | New registration, awaiting admin review        |
| `APPROVED`  | Verified, visible on marketplace               |
| `REJECTED`  | Documents insufficient or fraudulent             |
| `SUSPENDED` | Temporarily disabled (rating threshold / admin)  |

**Constraint:** `chk_companies_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'))`

---

### 3.3 `document_type`

| Value           | Description                        |
|-----------------|-------------------------------------|
| `TRADE_LICENSE` | Commercial / trade license           |
| `INSURANCE`     | Liability or cargo insurance         |
| `OTHER`         | Additional verification documents    |

**Constraint:** `chk_company_documents_type CHECK (document_type IN ('TRADE_LICENSE', 'INSURANCE', 'OTHER'))`

---

### 3.4 `document_status`

| Value       | Description                          |
|-------------|---------------------------------------|
| `PENDING`   | Uploaded, awaiting admin review        |
| `VERIFIED`  | Approved by admin                    |
| `REJECTED`  | Insufficient quality or invalid        |

**Constraint:** `chk_company_documents_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED'))`

---

### 3.5 `request_status`

| Value             | Description                                  |
|-------------------|-----------------------------------------------|
| `DRAFT`           | Customer editing, not yet submitted            |
| `SUBMITTED`       | Sent to selected companies                     |
| `OFFERS_PENDING`  | Awaiting company responses                     |
| `OFFER_RECEIVED`  | At least one offer received                    |
| `ACCEPTED`        | Customer accepted an offer                     |
| `COMPLETED`       | Move executed and finalized                    |
| `CANCELLED`       | Cancelled by customer or system                |

**Constraint:** `chk_move_requests_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'OFFERS_PENDING', 'OFFER_RECEIVED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'))`

---

### 3.6 `offer_status`

| Value       | Description                              |
|-------------|-------------------------------------------|
| `DRAFT`     | Company composing, not yet sent            |
| `SENT`      | Offer delivered to customer              |
| `ACCEPTED`  | Customer accepted this offer               |
| `REJECTED`  | Customer declined this offer               |
| `EXPIRED`   | Past expiration date, no longer valid      |

**Constraint:** `chk_offers_status CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'))`

---

### 3.7 `job_status`

| Value          | Description                              |
|----------------|-------------------------------------------|
| `SCHEDULED`    | Move booked, team assigned                |
| `IN_PROGRESS`  | Move actively being executed              |
| `COMPLETED`    | Move finished successfully                |
| `CANCELLED`    | Move cancelled after acceptance           |

**Constraint:** `chk_move_requests_job_status CHECK (job_status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))`

---

### 3.8 `parking_situation`

| Value          | Description                              |
|----------------|-------------------------------------------|
| `EASY`         | Direct parking in front of building       |
| `MODERATE`     | Some walking, limited parking             |
| `DIFFICULT`    | No parking zone, far walking distance       |
| `NO_PARKING`   | Must use loading zone / permit              |

**Constraint:** `chk_move_requests_parking CHECK (parking_situation IN ('EASY', 'MODERATE', 'DIFFICULT', 'NO_PARKING'))`

---

### 3.9 `elevator_type`

| Value       | Description                              |
|-------------|-------------------------------------------|
| `NONE`      | Stairs only                              |
| `SMALL`     | Passenger elevator (limited capacity)      |
| `LARGE`     | Large passenger elevator                   |
| `GOODS`     | Freight / goods elevator                   |

**Constraint:** `chk_move_requests_elevator CHECK (elevator_type IN ('NONE', 'SMALL', 'LARGE', 'GOODS'))`

---

### 3.10 Additional Enums

| Enum                  | Values                                                      | Table(s)              |
|-----------------------|-------------------------------------------------------------|-----------------------|
| `processing_status`   | `PENDING`, `PROCESSING`, `PROCESSED`, `FAILED`             | `videos`              |
| `ai_processing_status`| `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`             | `ai_analyses`         |
| `notification_type`   | Custom per-feature                                          | `notifications`       |
| `sent_via`            | `IN_APP`, `EMAIL`, `SMS`, `PUSH`                         | `notifications`       |
| `review_moderation`   | `PENDING`, `APPROVED`, `REJECTED`, `FLAGGED`             | `reviews`             |
| `subscription_status` | `INACTIVE`, `ACTIVE`, `TRIAL`, `EXPIRED`                  | `companies`           |
| `service_area_type`   | `ZIP_CODES`, `REGIONS`                                    | `companies`           |
| `team_member_role`    | `DRIVER`, `MOVER`, `TEAM_LEAD`, `HELPER`                 | `team_members`        |
| `service_pricing_type`| `FIXED`, `PER_HOUR`, `PER_ITEM`, `PER_KM`, `PER_M3`      | `service_addons`      |
| `commission_type`     | `PERCENTAGE`, `FIXED`, `TIERED`                         | `commissions`         |
| `invite_status`       | `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`              | `company_invites`     |
| `request_company_status`| `REQUESTED`, `VIEWED`, `DECLINED`, `OFFERED`, `EXPIRED`| `request_companies`   |
| `inventory_category`  | `FURNITURE`, `APPLIANCE`, `BOX`, `FRAGILE`, `GENERAL`   | `inventory_items`     |
| `admin_log_severity`  | `INFO`, `WARNING`, `CRITICAL`                            | `admin_logs`          |

---

## Section 4 — Indexes & Performance

### 4.1 Primary Key Index Strategy

All tables use `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`. InnoDB clusters data by the primary key, so all primary key lookups are O(log n) B-tree traversals with page-locality.

### 4.2 Foreign Key Indexes

Every foreign key column is explicitly indexed to ensure `JOIN`, `ON DELETE`, and `UPDATE CASCADE` operations execute efficiently:

| Index Name                        | Table               | Column(s)              | Purpose                                  |
|-----------------------------------|---------------------|------------------------|------------------------------------------|
| `idx_users_email`                 | `users`             | `email`                | Login lookup, uniqueness                 |
| `idx_users_role`                  | `users`             | `role`                | RBAC filtering                           |
| `idx_companies_user_id`           | `companies`         | `user_id`             | Owner lookup                             |
| `idx_companies_status`            | `companies`         | `status`              | Marketplace filtering                    |
| `idx_teams_company_id`            | `teams`             | `company_id`          | Company team listing                     |
| `idx_team_members_team_id`        | `team_members`      | `team_id`             | Team roster                              |
| `idx_availability_slots_team_date`| `availability_slots`| `team_id, slot_date`  | Unique constraint + daily lookup          |
| `idx_move_requests_user_id`       | `move_requests`     | `user_id`             | Customer request history                 |
| `idx_move_requests_video_id`      | `move_requests`     | `video_id`            | Video linkage                            |
| `idx_videos_user_id`              | `videos`            | `user_id`             | User video gallery                       |
| `idx_videos_move_request_id`      | `videos`            | `move_request_id`     | Request video linkage                    |
| `idx_ai_analyses_video_id`        | `ai_analyses`       | `video_id`            | Video -> analysis lookup                  |
| `idx_inventory_items_move_request`| `inventory_items`   | `move_request_id`     | Request inventory listing                |
| `idx_pricing_rules_company_id`    | `pricing_rules`     | `company_id`          | Company pricing lookup                   |
| `idx_service_addons_company_id`   | `service_addons`    | `company_id`          | Company services listing                   |
| `idx_offers_move_request_id`      | `offers`            | `move_request_id`     | Request offers                           |
| `idx_offers_company_id`           | `offers`            | `company_id`          | Company offer history                    |
| `idx_offer_services_offer_id`     | `offer_services`    | `offer_id`            | Offer detail services                    |
| `idx_reviews_company_id`          | `reviews`           | `company_id`          | Company review listing                   |
| `idx_commissions_company_id`      | `commissions`       | `company_id`          | Company commission report                |
| `idx_notifications_user_id`     | `notifications`     | `user_id`             | User inbox                               |
| `idx_request_companies_move_co`   | `request_companies` | `move_request_id, company_id` | Unique marketplace pair            |

### 4.3 Composite Indexes for Common Query Patterns

| Index Name                        | Table               | Column(s)                    | Query Pattern                              |
|-----------------------------------|---------------------|------------------------------|--------------------------------------------|
| `idx_move_requests_user_status`   | `move_requests`     | `user_id, status`            | "My active requests"                        |
| `idx_move_requests_status_date`   | `move_requests`     | `status, move_date`          | "Upcoming scheduled moves"                  |
| `idx_offers_move_company`         | `offers`            | `move_request_id, company_id`| "Did this company already offer?"           |
| `idx_offers_status_company`       | `offers`            | `status, company_id`        | "Company's active offers"                   |
| `idx_reviews_company_score`       | `reviews`           | `company_id, score`         | "Rating distribution"                       |
| `idx_availability_slots_date`     | `availability_slots`| `slot_date`                 | "All teams available on date"               |
| `idx_company_invites_company_status`| `company_invites` | `company_id, status`        | "Company's pending invites"                 |
| `idx_videos_retention_until`      | `videos`            | `retention_until`           | "Videos ready for purge"                    |
| `idx_users_deleted_at`            | `users`             | `deleted_at`                | "Active users only"                         |
| `idx_companies_avg_rating`        | `companies`         | `avg_rating`                | "Sort by rating"                            |
| `idx_notifications_user_read`     | `notifications`     | `user_id, is_read`          | "Unread notification count"                 |
| `idx_admin_logs_target`           | `admin_logs`        | `target_table, target_id`   | "Audit history for record"                  |
| `idx_commissions_is_paid`         | `commissions`       | `is_paid`                   | "Unpaid commission report"                  |
| `idx_company_documents_company_status` | `company_documents`| `company_id, status`    | "Pending docs per company"                  |

### 4.4 Fulltext Indexes

```sql
-- Fulltext search on company reviews (optional, add if search volume high)
CREATE FULLTEXT INDEX idx_reviews_text ON reviews(review_text);

-- Fulltext search on company names/descriptions (marketplace search)
CREATE FULLTEXT INDEX idx_companies_search ON companies(company_name, description);
```

### 4.5 Partitioning Recommendations (Future)

For high-volume platforms, consider partitioning:
- `notifications` — by `created_at` month (hot = recent, cold = old)
- `admin_logs` — by `created_at` month (immutable, archive after 1 year)
- `availability_slots` — by `slot_date` year (365-day rolling window)
- `videos` — by `created_at` month (retention lifecycle)

### 4.6 Covering Index Strategy

For the most frequent query — "List my move requests with status":
```sql
CREATE INDEX idx_move_requests_covering ON move_requests(user_id, status, move_date, id);
```
This covers `SELECT id, move_date FROM move_requests WHERE user_id = ? AND status = ?` without row lookups.

---

## Section 5 — GDPR & Data Retention

### 5.1 Tables with `deleted_at` Soft Delete

The following tables implement soft-delete for GDPR right-to-erasure and data recovery:

| Table               | Soft Delete | Rationale                                                    |
|---------------------|-------------|--------------------------------------------------------------|
| `users`             | Yes `deleted_at` | Account deletion; personal data anonymization required       |
| `companies`         | Yes `deleted_at` | Company account closure; legal retention of invoices         |
| `company_documents` | Yes `deleted_at` | Document lifecycle; retention for legal disputes             |
| `team_members`      | Yes `deleted_at` | Employee data; works council / labor law retention             |
| `move_requests`     | Yes `deleted_at` | Move history; customer right to delete                       |
| `inventory_items`   | Yes `deleted_at` | Linked to move request; cascade soft-delete                  |
| `service_addons`    | Yes `deleted_at` | Service catalog history; restore capability                    |
| `offers`            | Yes `deleted_at` | Pricing history; legal evidence for disputes                 |
| `reviews`           | Yes `deleted_at` | Review moderation; spam removal without data loss              |
| `company_invites`   | Yes `deleted_at` | Invite lifecycle; revoke without hard delete                   |
| `addresses`         | Yes `deleted_at` | Address book entries; user-managed deletion                  |

**Tables WITHOUT soft delete** (immutable / transactional / ephemeral):

| Table               | Rationale                                                    |
|---------------------|--------------------------------------------------------------|
| `teams`             | Active operational entity; hard-delete acceptable            |
| `availability_slots`| Daily capacity data; 90-day rolling purge                      |
| `videos`            | Lifecycle-managed (`is_deleted` + `retention_until`)         |
| `ai_analyses`       | Derived data; purge with video                                 |
| `pricing_rules`     | Versioned config; keep history for audit                       |
| `offer_services`    | Transactional junction; governed by offer lifecycle            |
| `commissions`       | Financial records — **NEVER soft delete** (legal requirement)|
| `notifications`     | Ephemeral inbox; 90-day auto-purge                             |
| `admin_logs`        | Audit trail — **immutable by design**                          |
| `request_companies` | Transactional marketplace junction; governed by request        |

### 5.2 Video Retention Policy

| Phase                        | Retention Rule                                               | Field(s)                  |
|------------------------------|--------------------------------------------------------------|---------------------------|
| Upload to AI processing      | Max **30 days** from `created_at`                            | `retention_until`         |
| After offer sent             | **Auto-delete within 24h** — `deleted_reason = 'OFFER_SENT'` | `is_deleted`, `deleted_at`|
| After move completion        | **Auto-delete within 7 days** — `deleted_reason = 'COMPLETED'` | `is_deleted`, `deleted_at`|
| Customer account deletion    | Immediate purge — `deleted_reason = 'USER_DELETED'`            | `is_deleted`, `deleted_at`|
| System nightly purge job     | Delete `is_deleted = TRUE` AND `deleted_at < NOW() - INTERVAL 7 DAY` | N/A (hard S3 delete)      |

```sql
-- Nightly purge query (runs as background job)
SELECT id, s3_bucket, s3_key 
FROM videos 
WHERE is_deleted = TRUE 
  AND deleted_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
-- -> Delete from S3, then hard-delete row
```

### 5.3 Personal Data Fields Identified (GDPR Article 4)

| Table         | Personal Data Fields                                         |
|---------------|--------------------------------------------------------------|
| `users`       | `email`, `first_name`, `last_name`, `phone`, `last_login_ip` |
| `companies`   | `phone`, `email`, `tax_id`, `registration_number`            |
| `team_members`| `first_name`, `last_name`, `phone`, `email`, `emergency_contact`, `emergency_phone` |
| `addresses`   | `street`, `street_number`, `postal_code`, `city`, `latitude`, `longitude` |
| `reviews`     | `review_text` (may contain personal anecdotes)               |
| `videos`      | `s3_key`, `s3_url` (video content = visual personal data)    |
| `company_documents` | `file_url` (may contain personal info in scans)          |
| `notifications` | `title`, `body`, `data_json` (may reference personal data) |

### 5.4 Data Anonymization Strategy for Account Deletion

When a user invokes **Right to Erasure** (GDPR Article 17):

```sql
-- Step 1: Soft-delete user
UPDATE users SET deleted_at = NOW(), email = CONCAT('anon_', id, '@deleted.local') WHERE id = ?;

-- Step 2: Anonymize identifiable fields
UPDATE users SET 
  first_name = 'Deleted',
  last_name = 'User',
  phone = NULL,
  password_hash = 'ANONYMIZED',
  profile_image_url = NULL,
  last_login_ip = NULL
WHERE id = ?;

-- Step 3: Anonymize linked addresses
UPDATE addresses SET 
  street = 'REDACTED',
  street_number = NULL,
  postal_code = '00000',
  city = 'REDACTED',
  latitude = NULL,
  longitude = NULL,
  access_notes = NULL
WHERE user_id = ?;

-- Step 4: Delete videos immediately
UPDATE videos SET is_deleted = TRUE, deleted_reason = 'USER_DELETED', deleted_at = NOW() 
WHERE user_id = ?;

-- Step 5: Soft-delete team members (if company owner)
UPDATE team_members SET 
  first_name = 'Deleted',
  last_name = 'User',
  phone = NULL,
  email = NULL,
  emergency_contact = NULL,
  emergency_phone = NULL
WHERE team_id IN (SELECT id FROM teams WHERE company_id IN (SELECT id FROM companies WHERE user_id = ?));

-- Step 6: Anonymize reviews (keep score for aggregation, remove text)
UPDATE reviews SET review_text = '[REDACTED -- USER DELETED]' WHERE reviewer_user_id = ?;
```

**Retention exceptions** (GDPR Article 17(3)):
- `commissions` — financial records retained for **10 years** (tax law § 147 AO Germany)
- `admin_logs` — audit trail retained for **7 years**
- `offers` — transactional evidence retained for **6 years** (commercial code)
- `move_requests` — metadata retained (dates, prices) but PII anonymized

---

## Section 6 — Key Queries

### 6.1 Finding Available Companies for a Move Date

Find companies with service area matching the move's postal code and with team capacity available on the requested date.

```sql
SELECT 
  c.id AS company_id,
  c.company_name,
  c.slug,
  c.avg_rating,
  c.total_reviews,
  t.id AS team_id,
  t.team_name,
  t.max_jobs_per_day,
  COALESCE(ast.capacity_total, t.max_jobs_per_day) - COALESCE(ast.capacity_used, 0) AS available_capacity,
  pr.price_per_hour,
  pr.base_fee
FROM companies c
INNER JOIN teams t ON t.company_id = c.id AND t.is_active = TRUE
LEFT JOIN availability_slots ast 
  ON ast.team_id = t.id AND ast.slot_date = '2024-06-15'
LEFT JOIN pricing_rules pr 
  ON pr.company_id = c.id AND pr.is_default = TRUE AND pr.is_active = TRUE
WHERE c.status = 'APPROVED'
  AND c.deleted_at IS NULL
  -- Service area check: JSON contains postal code (or use addresses table with spatial index)
  AND JSON_CONTAINS(c.service_area_data, '"10115"', '$')
  -- Capacity check: either no slot record (team has full capacity) or has remaining capacity
  AND (ast.id IS NULL OR ast.is_blocked = FALSE)
  AND (ast.id IS NULL OR ast.capacity_used < ast.capacity_total)
ORDER BY c.avg_rating DESC, c.total_reviews DESC;
```

### 6.2 Calculating a Price Estimate

System-calculated price estimate for a move request using a company's pricing rules.

```sql
SELECT 
  mr.id AS move_request_id,
  c.id AS company_id,
  c.company_name,
  pr.price_per_hour,
  pr.price_per_km,
  pr.base_fee,
  pr.team_size,
  pr.min_hours,
  pr.weekend_multiplier,
  mr.estimated_distance_km,
  mr.move_date,
  -- Base calculation
  pr.base_fee AS calc_base_fee,
  (COALESCE(mr.estimated_distance_km, 0) * pr.price_per_km) AS calc_distance_fee,
  -- Estimated hours: derived from volume (e.g., 10m3 = ~3 hours) or use AI estimate
  GREATEST(
    pr.min_hours,
    (SELECT COALESCE(SUM(volume_m3), 0) * 0.3 FROM inventory_items WHERE move_request_id = mr.id)
  ) AS calc_estimated_hours,
  -- Subtotal before multiplier
  (pr.base_fee 
    + (COALESCE(mr.estimated_distance_km, 0) * pr.price_per_km)
    + (GREATEST(
        pr.min_hours,
        (SELECT COALESCE(SUM(volume_m3), 0) * 0.3 FROM inventory_items WHERE move_request_id = mr.id)
      ) * pr.price_per_hour)
  ) AS calc_subtotal,
  -- Apply weekend multiplier
  CASE 
    WHEN DAYOFWEEK(mr.move_date) IN (1, 7) THEN pr.weekend_multiplier 
    ELSE 1.00 
  END AS calc_day_multiplier,
  -- Final estimated price
  ROUND(
    (pr.base_fee 
      + (COALESCE(mr.estimated_distance_km, 0) * pr.price_per_km)
      + (GREATEST(
          pr.min_hours,
          (SELECT COALESCE(SUM(volume_m3), 0) * 0.3 FROM inventory_items WHERE move_request_id = mr.id)
        ) * pr.price_per_hour)
    ) * CASE WHEN DAYOFWEEK(mr.move_date) IN (1, 7) THEN pr.weekend_multiplier ELSE 1.00 END,
    2
  ) AS estimated_total_price
FROM move_requests mr
CROSS JOIN companies c
INNER JOIN pricing_rules pr ON pr.company_id = c.id AND pr.is_default = TRUE
WHERE mr.id = 12345
  AND c.status = 'APPROVED'
  AND c.deleted_at IS NULL;
```

### 6.3 Getting a Company's Average Rating

Live calculation (for cache refresh) vs. cached value on `companies` table.

```sql
-- Live calculation with distribution breakdown
SELECT 
  c.id AS company_id,
  c.company_name,
  COUNT(r.id) AS total_reviews,
  ROUND(AVG(r.score), 2) AS avg_rating,
  ROUND(AVG(r.score), 1) AS avg_rating_stars,
  COUNT(CASE WHEN r.score = 5 THEN 1 END) AS stars_5,
  COUNT(CASE WHEN r.score = 4 THEN 1 END) AS stars_4,
  COUNT(CASE WHEN r.score = 3 THEN 1 END) AS stars_3,
  COUNT(CASE WHEN r.score = 2 THEN 1 END) AS stars_2,
  COUNT(CASE WHEN r.score = 1 THEN 1 END) AS stars_1,
  -- Flag for admin if rating drops below threshold
  CASE WHEN AVG(r.score) < 3.0 THEN 'FLAG_FOR_REVIEW' ELSE 'OK' END AS rating_alert
FROM companies c
LEFT JOIN reviews r 
  ON r.company_id = c.id 
  AND r.is_public = TRUE 
  AND r.admin_moderation_status = 'APPROVED'
  AND r.deleted_at IS NULL
WHERE c.id = 42
  AND c.deleted_at IS NULL
GROUP BY c.id, c.company_name;

-- Cache refresh query (run after new review insertion)
UPDATE companies c
SET 
  avg_rating = (
    SELECT ROUND(AVG(score), 1) 
    FROM reviews 
    WHERE company_id = c.id 
      AND is_public = TRUE 
      AND admin_moderation_status = 'APPROVED'
      AND deleted_at IS NULL
  ),
  total_reviews = (
    SELECT COUNT(*) 
    FROM reviews 
    WHERE company_id = c.id 
      AND is_public = TRUE 
      AND admin_moderation_status = 'APPROVED'
      AND deleted_at IS NULL
  )
WHERE c.id = 42;
```

### 6.4 Listing All Requests for a Company Inbox

Company dashboard: requests that were sent to this company, with AI summary and offer status.

```sql
SELECT 
  mr.id AS move_request_id,
  mr.request_number,
  mr.move_date,
  mr.from_address->>'$.city' AS from_city,
  mr.to_address->>'$.city' AS to_city,
  mr.status AS request_status,
  mr.customer_notes,
  u.first_name AS customer_first_name,
  u.last_name AS customer_last_name,
  ai.total_volume_m3,
  ai.estimated_weight_kg,
  ai.confidence_score,
  (SELECT COUNT(*) FROM inventory_items WHERE move_request_id = mr.id AND deleted_at IS NULL) AS item_count,
  rc.status AS request_company_status,
  rc.viewed_at,
  o.id AS offer_id,
  o.status AS offer_status,
  o.total_price,
  o.sent_at
FROM move_requests mr
INNER JOIN request_companies rc 
  ON rc.move_request_id = mr.id AND rc.company_id = 42
INNER JOIN users u ON u.id = mr.user_id
LEFT JOIN ai_analyses ai ON ai.move_request_id = mr.id
LEFT JOIN offers o 
  ON o.move_request_id = mr.id AND o.company_id = 42 AND o.deleted_at IS NULL
WHERE mr.status IN ('SUBMITTED', 'OFFERS_PENDING', 'OFFER_RECEIVED')
  AND mr.deleted_at IS NULL
  AND u.deleted_at IS NULL
ORDER BY 
  CASE WHEN rc.viewed_at IS NULL THEN 0 ELSE 1 END ASC, -- Unviewed first
  mr.move_date ASC;
```

### 6.5 Checking Team Capacity for a Date

Before assigning a team to an offer, verify they have capacity left.

```sql
-- Check a specific team's capacity on a date
SELECT 
  t.id AS team_id,
  t.team_name,
  t.max_jobs_per_day AS default_capacity,
  COALESCE(ast.capacity_used, 0) AS jobs_assigned,
  COALESCE(ast.capacity_total, t.max_jobs_per_day) AS capacity_total,
  COALESCE(ast.capacity_total, t.max_jobs_per_day) - COALESCE(ast.capacity_used, 0) AS remaining_capacity,
  ast.is_blocked,
  ast.blocked_reason
FROM teams t
LEFT JOIN availability_slots ast 
  ON ast.team_id = t.id AND ast.slot_date = '2024-06-15'
WHERE t.company_id = 42
  AND t.is_active = TRUE
HAVING remaining_capacity > 0 AND (ast.is_blocked IS NULL OR ast.is_blocked = FALSE);

-- Atomically reserve capacity (use in transaction)
INSERT INTO availability_slots (team_id, slot_date, capacity_used, capacity_total)
VALUES (10, '2024-06-15', 1, 2)
ON DUPLICATE KEY UPDATE 
  capacity_used = capacity_used + 1,
  updated_at = NOW();
-- Then verify capacity_used <= capacity_total (enforced by CHECK constraint)
```

### 6.6 Bonus: Post-Move Commission Calculation

Triggered after `move_requests` status changes to `COMPLETED`.

```sql
INSERT INTO commissions (
  move_request_id, offer_id, company_id, 
  commission_amount, commission_rate, commission_type,
  subtotal_amount, platform_fee_amount, payout_amount,
  is_paid, created_at
)
SELECT 
  mr.id,
  mr.accepted_offer_id,
  o.company_id,
  -- Commission: dynamic based on company rating (lower rating = higher commission)
  ROUND(o.total_price * (c.commission_rate / 100), 2),
  c.commission_rate,
  'PERCENTAGE',
  o.total_price,
  0.00, -- platform fee TBD
  ROUND(o.total_price * (1 - c.commission_rate / 100), 2),
  FALSE,
  NOW()
FROM move_requests mr
INNER JOIN offers o ON o.id = mr.accepted_offer_id
INNER JOIN companies c ON c.id = o.company_id
WHERE mr.id = 12345
  AND mr.status = 'COMPLETED'
  AND mr.job_status = 'COMPLETED';
```

---

## Appendix: Execution Order

Run DDL in this order to satisfy foreign key dependencies:

```sql
-- 1. Base tables (no FKs or self-referencing)
CREATE TABLE users;
CREATE TABLE videos;          -- self-contained, FK to users added after move_requests

-- 2. Tables depending on users
CREATE TABLE companies;
CREATE TABLE notifications;
CREATE TABLE admin_logs;
CREATE TABLE company_invites;

-- 3. Tables depending on companies
CREATE TABLE company_documents;
CREATE TABLE teams;
CREATE TABLE pricing_rules;
CREATE TABLE service_addons;

-- 4. Tables depending on teams
CREATE TABLE team_members;
CREATE TABLE availability_slots;

-- 5. Tables depending on videos + companies
CREATE TABLE ai_analyses;
CREATE TABLE move_requests;   -- FK to videos, ai_analyses (circular resolved)

-- 6. Tables depending on move_requests
CREATE TABLE inventory_items;
CREATE TABLE request_companies;
CREATE TABLE offers;

-- 7. Tables depending on offers
CREATE TABLE offer_services;
CREATE TABLE reviews;
CREATE TABLE commissions;

-- 8. Optional address normalization
CREATE TABLE addresses;

-- 9. All CREATE INDEX statements (included inline above)
```

> **Note:** `move_requests` has FKs to `videos` and `ai_analyses`. If creating fresh, either:
> - Create `videos` and `ai_analyses` first (without `move_request_id` FK), then `move_requests`, then `ALTER TABLE` to add remaining FKs, OR
> - Create `move_requests` first without `video_id` and `ai_analysis_id` FKs, then add them via `ALTER TABLE` after the referenced tables exist.

---

*Schema Version: 1.0.0*  
*Last Updated: 2024*  
*Maintainer: point4Studio Engineering*
