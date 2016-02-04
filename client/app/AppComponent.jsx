import React from 'react';
import { Link } from 'react-router';

export default class AppComponent extends React.Component {

  static propTypes = {
    children: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array,
    ]).isRequired,
  };

  render() {
    return (
      <div className="app">
        <div className="top-bar">
          <div className="top-bar-left">
            <ul className="menu" >
              <li className="menu-text" >Speedtest</li>
              <li><Link to="/" >Statistics</Link></li>
              <li><Link to="settings" href="#">Settings</Link></li>
            </ul>
          </div>
        </div>
        <div className="row" >
          {this.props.children}
        </div>
      </div>
    );
  }
}
