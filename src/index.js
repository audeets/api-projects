import express from 'express';
import app from '@audeets/audeets-api-commons/app.js';
import server from '@audeets/audeets-api-commons/server.js';
import routerProjects from './routes/projects.js';
import routerProject from './routes/project.js';
import routerScores from './routes/scores.js';
import routerAudits from './routes/audits.js';
import routerRolling from './routes/rolling.js';

const router = express.Router();
routerProjects.addRoutes(router, '/');
routerProject.addRoutes(router, '/:id');
routerScores.addRoutes(router, '/:id/scores');
routerAudits.addRoutes(router, '/:id/audits');
routerRolling.addRoutes(router, '/:id/rolling');

const expressApp = app.createApp('GET,POST,DELETE,PUT');
expressApp.use('/api/projects', router);
server.createServer(expressApp, '5080', '5443');
