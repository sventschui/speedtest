/* eslint no-unused-vars: [2, { "varsIgnorePattern": "colors" }] */
/* eslint no-console: 0 */

import { MongoClient } from 'mongodb';
import colors from 'colors';

import promiseFromCb from './promiseFromCb';

const host = process.env.MONGODB_HOST || '127.0.0.1';
const port = process.env.MONGODB_PORT || 27017;
const db = process.env.MONDODB_DB || 'speedtest';

const url = `mongodb://${host}:${port}/${db}`;

console.log(`Using mongodb connection string ${url.red}`);

const connection = promiseFromCb((cb) => {
  MongoClient.connect(url, cb);
});

process.on('exit', () => {
  connection.then(_db => _db.close());
});

export default connection;
