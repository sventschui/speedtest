import express from 'express';
import { json } from 'body-parser';

import { settings, patchSettings } from './settings.model';

const settingsApi = express();

settingsApi.use(json());

settingsApi.get('/', (req, res, next) => {
  settings
    .map(settings => ({
      success: true,
      data: settings,
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
  const result = patchSettings(req.body)
    .endOnError();

  result.onValue(() => {
    res.send({
      success: true,
    });
    next();
  });

  result.onError(error => {
    res.send(error);
    next();
  });
});

export default settingsApi;
