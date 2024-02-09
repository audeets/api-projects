import app from "./app.js";
import server from "@benoitquette/audeets-api-commons/server.js";

server.createServer(app, "5080", "5443");
