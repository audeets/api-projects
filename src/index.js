import app from "@benoitquette/audeets-api-commons/app.js";
import server from "@benoitquette/audeets-api-commons/server.js";
import router from "./routes/projects.js";

const expressApp = app.createApp("GET,POST,DELETE,PUT");
expressApp.use("/api/projects", router);
server.createServer(expressApp, "5080", "5443");
