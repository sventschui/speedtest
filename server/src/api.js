/* eslint no-console: 0 */

import express from 'express';
import http from 'http';
import _io from 'socket.io';
import cors from 'express-cors';
import { CronJob } from 'cron';

import settingsApi from './settings/settings.api';

import speedtests from './api/speedtests';
import speedtestModel from './speedtest/SpeedtestModel';

const app = express();
const server = http.createServer(app);
const io = _io(server);

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION', error.stack);
});

app.use(cors({
  allowedOrigins: [
    'localhost:3000',
  ],
}));

app.use((req, res, next) => {
  console.log(`Handling request on ${req.method.blue} ${req.originalUrl.red}`);
  next();
});

app.use('/speedtests', speedtests);
app.use('/settings', settingsApi);

io.set('origins', 'http://localhost:3000');

io.on('connection', (socket) => {
  console.log('connected...');

  socket.on('speedtest.trigger', () => {
    speedtestModel.trigger();
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});

speedtestModel.on('started', (data) => {
  io.emit('speedtest.started', data);
});

speedtestModel.on('finished', (data) => {
  io.emit('speedtest.finished', data);
});

const job = new CronJob('*/5 * * * *', () => {
  speedtestModel.trigger();
}, undefined, false, undefined, undefined, true);

job.start();

server.listen(3001);
