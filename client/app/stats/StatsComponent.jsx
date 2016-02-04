import React from 'react';
import { Line } from 'react-chartjs';
import moment from 'moment';
import { Combinator } from "react-combinators/baconjs"

import DownloadUploadChart from './DownloadUploadChart';

import _statsModel from './statsModel';

const statsModel = _statsModel();

export default class SettingsComponent extends React.Component {
  render() {
    return (
      <Combinator>
        <div className="stats" >
          <h1>Stats</h1>
          <DownloadUploadChart {...statsModel} width="100%" height="200px" />
        </div>
      </Combinator>
    );
  }
}
