const Database = require("./modules/Database");
const ApiServer = require("./modules/ApiServer");

const database = new Database();
const apiServer = new ApiServer(process.env.PORT, database);

apiServer.start();
