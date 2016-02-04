import Bacon from 'baconjs';
import _ from 'lodash';
import escapeKey from 'mongo-key-escape';

import db from '../utils/db';

const _settingsCollection = Bacon.fromPromise(db)
  .map(_db => _db.collection('settings'))
  .toProperty();

const _patchSettingsComplete = new Bacon.Bus();

// store values to the database every time patchSettings is invoked
function patchSettings(payload) {
  const update = {};
  const del = {};

  try {
    _.forEach(payload, (val, key) => {
      if (key === '_id') {
        throw new Error('key _id may not be modified');
      }

      if (key.indexOf('.') !== -1) {
        throw new Error('keys may not contain \'.\'');
      }

      if (key.indexOf('$') !== -1) {
        throw new Error('keys may not contain \'$\'');
      }

      const escapedKey = escapeKey.escape(key);

      if (val === null) {
        del[escapedKey] = '';
      } else {
        update[escapedKey] = val;
      }
    });
  } catch (e) {
    return Bacon.once(new Bacon.Error(e.message));
  }

  const upsert = {};

  if (_.size(update) > 0) {
    upsert.$set = update;
  }

  if (_.size(del) > 0) {
    upsert.$unset = del;
  }

  if (_.size(upsert) === 0) {
    return Bacon.once(new Bacon.Error('Expected at least one property to update/delete'));
  }

  const result = _settingsCollection.flatMapLatest(settingsCollection =>
    Bacon.fromPromise(settingsCollection.updateOne({}, upsert, {
      upsert: true,
    }))
  );

  _patchSettingsComplete.plug(result);

  return result;
}

const settings = Bacon.mergeAll(
  Bacon.once(),
  _patchSettingsComplete
)
  .flatMapLatest(() => _settingsCollection)
  .flatMapLatest(settingsCollection =>
    Bacon.fromPromise(settingsCollection.find({}).limit(0).next())
  )
  .skipDuplicates()
  .map(_settings => {
    // remove _id from settings
    const { _id, ...filtered } = _settings;

    return filtered;
  })
  .toProperty();

settings.onValue(() => {
  // TODO: get rid of monkey patch
});

export {
  settings,
  patchSettings,
};
