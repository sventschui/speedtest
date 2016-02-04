import Bacon from 'baconjs';
import { createAction } from 'megablob';
import request from 'superagent';
import io from 'socket.io-client';
const socket = io('http://localhost:3001');

const speedTestFinished = Bacon.fromBinder(cb => {
  socket.on('speedtest.finished', () => {
    console.log('speedtest.finished');
    cb();
  });
});

export default function statsModel() {
  const filter = createAction();

  const loadStats = Bacon.combineWith(
    filter.$,
    speedTestFinished.doLog('speedTestFinished'),
    _filter => _filter
  )
    .startWith(null)
    .flatMapLatest(_filter => Bacon.fromNodeCallback(cb => {
      request.get('http://localhost:3001/speedtests')
        .query(_filter)
        .end(cb);
    }))
    .map(response => response.body);

  const stats = loadStats
    .flatMapError(() => Bacon.once(null))
    .merge(filter.$.map(() => null));

  const loading = loadStats
    .map(() => false)
    .merge(filter.$.map(() => true));

  const error = loadStats
    .map(() => null)
    .flatMapError(_error => Bacon.once(_error));

  return {
    filter,
    stats,
    loading,
    error,
  };
}
