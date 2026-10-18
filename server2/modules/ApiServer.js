// Claude AI was used to help set up the API server.
const http = require("http");
const MESSAGES = require("../lang/en");

const INSERT_PATH = "/lab5/api/v1/insert";
const SQL_PATH = "/lab5/api/v1/sql/";
const PERMISSION_DENIED_ERROR = 1142;

class ApiServer {
    constructor(port, database) {
        this.port = port;
        this.database = database;
    }

    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        server.listen(this.port, () => {
            console.log(MESSAGES.serverRunning, this.port);
        });
    }

    async handleRequest(req, res) {
        this.setCorsHeaders(res);
        const url = new URL(req.url, "http://localhost");
        const path = url.pathname;

        try {
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
            } else if (req.method === "POST" && path === INSERT_PATH) {
                await this.handleInsert(res);
            } else if (req.method === "GET" && path.startsWith(SQL_PATH)) {
                await this.handleSelect(res, path);
            } else {
                this.sendJson(res, 404, { success: false, error: MESSAGES.notFound });
            }
        } catch (err) {
            this.handleError(res, err);
        }
    }

    async handleInsert(res) {
        const insertedRows = await this.database.insertPatients();
        this.sendJson(res, 201, {
            success: true,
            message: MESSAGES.rowsInserted,
            insertedRows: insertedRows,
        });
    }

    async handleSelect(res, path) {
        // Take the part after "/lab5/api/v1/sql/"
        const encodedQuery = path.substring(SQL_PATH.length);

        let query;
        try {
            query = decodeURIComponent(encodedQuery);
        } catch (err) {
            this.sendJson(res, 400, { success: false, error: MESSAGES.invalidEncoding });
            return;
        }

        query = query.trim();

        // Remove the double quotes around the query, e.g. "select * from patient"
        if (query.startsWith('"') && query.endsWith('"')) {
            query = query.substring(1, query.length - 1).trim();
        }

        if (query === "") {
            this.sendJson(res, 400, { success: false, error: MESSAGES.emptyQuery });
            return;
        }

        const rows = await this.database.runSelect(query);
        this.sendJson(res, 200, { success: true, rows: rows });
    }

    handleError(res, err) {
        if (err.errno === PERMISSION_DENIED_ERROR) {
            // The DB user does not have permission (e.g. DROP, DELETE, UPDATE)
            this.sendJson(res, 403, { success: false, error: MESSAGES.permissionDenied + ": " + err.sqlMessage });
        } else if (err.sqlMessage) {
            // Any other error from the database (e.g. syntax error)
            this.sendJson(res, 400, { success: false, error: MESSAGES.badQuery + ": " + err.sqlMessage });
        } else {
            // Not a database error, e.g. cannot connect to the database
            console.error(err);
            this.sendJson(res, 500, { success: false, error: MESSAGES.serverError });
        }
    }

    setCorsHeaders(res) {
        res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    sendJson(res, status, data) {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    }
}

module.exports = ApiServer;
