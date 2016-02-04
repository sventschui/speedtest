import Bacon from 'baconjs';

import db from '../utils/db';

const _settingsCollection = Bacon.fromPromise(db)
  .map(_db => _db.collection('settings'))
  .toProperty();

const _patchSettingsComplete = new Bacon.Bus();

// store values to the database every time patchSettings is invoked
function patchSettings(payload) {
  const result = _settingsCollection.flatMapLatest(settingsCollection => Bacon.fromPromise(settingsCollection.updateOne({}, {
    $set: payload,
  }, {
    upsert: true,
  })));

  _patchSettingsComplete.plug(result.doLog('done'));

  return result;
}

const settings = Bacon.combineWith(
  _settingsCollection,
  _patchSettingsComplete.startWith().doLog('patchComplete'), // won't work =(
  settingsCollection => settingsCollection
)
  .flatMapLatest(settingsCollection => Bacon.fromPromise(settingsCollection.find({}).limit(0).next()))
  .doLog('settings')
  .skipDuplicates()
  .toProperty();

export {
  settings,
  patchSettings,
}

