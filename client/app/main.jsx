/* eslint no-unused-vars: [2, { "varsIgnorePattern": "React" }] */

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, IndexRoute, Route } from 'react-router';
import { createHistory } from 'history';

import AppComponent from './AppComponent';
import SettingsComponent from './settings/SettingsComponent';
import StatsComponent from './stats/StatsComponent';

const history = createHistory();

ReactDOM.render((
  <Router history={history} >
    <Route path="/" component={AppComponent} >
      <Route path="/settings" component={SettingsComponent} />
      <IndexRoute component={StatsComponent} />
    </Route>
  </Router>
), document.getElementById('stage'));
