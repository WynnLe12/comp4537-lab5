-- Run once as root on a new server: sudo mariadb < setup.sql
-- Replace <password> with real passwords before running. Never commit real passwords.

CREATE DATABASE IF NOT EXISTS lab5;
USE lab5;

-- The table must exist before granting privileges on it
CREATE TABLE IF NOT EXISTS patient (
    patientid   INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    dateOfBirth DATETIME NOT NULL
) ENGINE=InnoDB;

-- Writer: used by the Insert button (fixed SQL written in the server)
CREATE USER IF NOT EXISTS 'lab5_writer'@'localhost' IDENTIFIED BY '<password>';
GRANT CREATE, INSERT ON lab5.patient TO 'lab5_writer'@'localhost';

-- Reader: used for queries typed in the textarea
CREATE USER IF NOT EXISTS 'lab5_reader'@'localhost' IDENTIFIED BY '<password>';
GRANT SELECT ON lab5.patient TO 'lab5_reader'@'localhost';

FLUSH PRIVILEGES;
