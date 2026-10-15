const mysql = require("mysql2/promise");

const CREATE_TABLE_SQL =
    "CREATE TABLE IF NOT EXISTS patient (" +
    "patientid INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
    "name VARCHAR(100) NOT NULL, " +
    "dateOfBirth DATETIME NOT NULL" +
    ") ENGINE=InnoDB";

const INSERT_PATIENTS_SQL =
    "INSERT INTO patient (name, dateOfBirth) VALUES " +
    "('Sara Brown', '1901-01-01'), " +
    "('John Smith', '1941-01-01'), " +
    "('Jack Ma', '1961-01-30'), " +
    "('Elon Musk', '1999-01-01')";

class Database {
    constructor() {
        // Writer user: only has CREATE and INSERT on the patient table
        this.writerPool = this.createPool(process.env.DB_WRITER_USER, process.env.DB_WRITER_PASSWORD);

        // Reader user: only has SELECT on the patient table
        this.readerPool = this.createPool(process.env.DB_READER_USER, process.env.DB_READER_PASSWORD);
    }

    createPool(user, password) {
        return mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: user,
            password: password,
            dateStrings: true,
        });
    }

    async createTableIfNotExists() {
        await this.writerPool.query(CREATE_TABLE_SQL);
    }

    async insertPatients() {
        await this.createTableIfNotExists();
        const results = await this.writerPool.query(INSERT_PATIENTS_SQL);
        const info = results[0];
        return info.affectedRows;
    }

    async runSelect(sql) {
        const results = await this.readerPool.query(sql);
        const rows = results[0];
        return rows;
    }
}

module.exports = Database;
