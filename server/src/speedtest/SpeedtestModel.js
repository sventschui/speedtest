/* eslint no-console: 0 */

import uuid from 'uuid';
import EventEmitter from 'events';
import speedtestNet from 'speedtest-net';

import _db from '../utils/db';
import promiseFromCb from '../utils/promiseFromCb';

class SpeedtestModel extends EventEmitter {

  constructor() {
    super();
    this.on('error', (err) => {
      console.log('error', err);
    });
  }

  trigger() {
    console.log('Starting speed test');

    _db.then((db) => {
      const speedtests = db.collection('speedtests');
      const id = uuid.v4();
      const data = {
        id,
        finished: false,
        startTime: new Date(),
      };

      promiseFromCb((cb) => speedtests.insertOne(data, cb))
        .then(() => {
          const _id = data._id;

          delete data._id;

          this.emit('started', data);

          speedtestNet()
            .on('error', (error) => {
              this.emit('error', `Speedtest failed: ${error}`);

              promiseFromCb(cb => speedtests.updateOne({
                _id,
              }, {
                $set: {
                  finished: true,
                  error: true,
                  errorData: error,
                },
              }, cb))
                .catch(() => {
                  this.emit('error', 'Failed to store the speedtest error');
                });
            })
            .on('data', (speedtestResult) => {
              console.log(`Speedtest ${data.id.red} done`);

              promiseFromCb(cb => speedtests.updateOne({
                _id,
              }, {
                $set: {
                  finished: true,
                  error: false,
                  result: speedtestResult,
                },
              }, cb))
                .then(() => {
                  this.emit('finished', speedtestResult);
                })
                .catch(error => {
                  this.emit('error',
                    `Failed to update speedtest data for test ${data.id} in mongodb ${error}`
                  );
                });
            });
        })
        .catch(error => {
          this.emit('error', `Failed to store speedtest in mongodb ${error}`);
        });
    })
      .catch(this.handleDbConnectError.bind(this));
  }

  handleDbConnectError(error) {
    console.log('connection failed', error);
    this.emit('error', 'connection failed');
  }

}

const instance = new SpeedtestModel();

export default instance;
