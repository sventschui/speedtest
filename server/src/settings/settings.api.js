import express from 'express';
import { json } from 'body-parser';

import { settings, patchSettings } from './settings.model';

const settingsApi = express();

settingsApi.use(json());

settingsApi.get('/', (req, res, next) => {
  settings
    .map(data => ({
      success: true,
      data,
    }))
    .flatMapError(error => ({
      error,
    }))
    .first()
    .onValue(payload => {
      res.send(payload);
      next();
    });
});

settingsApi.patch('/', (req, res, next) => {
  patchSettings(req.body)
    .map(() => ({
      status: 200,
      payload: {
        success: true,
      },
    }))
    .flatMapError(error => ({
      status: 400,
      payload: {
        error,
      },
    }))
    .first()
    .onValue((data) => {
      res.status(data.status || 200);
      res.send(data.payload);
      next();
    });
});

export default settingsApi;
