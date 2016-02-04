import Bacon from 'baconjs';
import { createAction } from 'megablob';
import request from 'superagent';
import io from 'socket.io-client';
const socket =  io('http://localhost:3001');

const speedTestFinished = Bacon.fromBinder(cb => {
  socket.on('speedtest.finished', () => {
    console.log('speedtest.finished');
    cb();
  });
});

export default function statsModel() {

  const filter = createAction();

  const loadStats = Bacon.combineWith(filter.$, speedTestFinished.doLog('speedTestFinished'), filter => filter)
    .startWith(null)
    .flatMapLatest(filter => Bacon.fromNodeCallback(cb =>  {
      request.get('http://localhost:3001/speedtests')
        .query(filter)
        .end(cb);
    }))
    .map(response => response.body);

  const stats = loadStats
    .flatMapError(error => Bacon.once(null))
    .merge(filter.$.map(filter => null));

  const loading = loadStats
    .map(stats => false)
    .merge(filter.$.map(filter => true));

  const error = loadStats
    .map(stats => null)
    .flatMapError(error => Bacon.once(error));

  return {
    filter,
    stats,
    loading,
    error,
  }

}
