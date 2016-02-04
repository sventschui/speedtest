import express from 'express';
import { json } from 'body-parser';

import _db from '../utils/db';
import promiseFromCb from '../utils/promiseFromCb';

const speedtestsApi = express();

speedtestsApi.use(json());

speedtestsApi.get('/', (req, res, next) => {
  _db.then(db => {
    const speedtests = db.collection('speedtests');

    promiseFromCb((cb) => {
      speedtests.find({}).toArray(cb);
    })
      .then((data) => {
        res.send(data);
        next();
      })
      .catch((error) => {
        res.send({
          error: true,
          message: `Failed to load speedtests from mongodb ${error.toString()}`,
        });
        next();
      });
  })
    .catch(error => {
      res.send({
        error: true,
        message: `Failed to connect to mongodb ${error.toString()}`,
      });
      next();
    });
});

export default speedtestsApi;
