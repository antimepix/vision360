-- ============================================
-- Vision360 — MySQL Setup Script
-- Run this ONCE after installing MySQL
-- ============================================

-- 1. Create database
CREATE DATABASE IF NOT EXISTS `projet_360_v3`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create dedicated user (matches .env)
CREATE USER IF NOT EXISTS 'vision360'@'localhost'
  IDENTIFIED BY 'vision360pass';

GRANT ALL PRIVILEGES ON `projet_360_v3`.* TO 'vision360'@'localhost';
FLUSH PRIVILEGES;

-- 3. Now import the schema + data:
--    mysql -u vision360 -pvision360pass projet_360_v3 < vision360/db/vision360_init_from_json.sql
