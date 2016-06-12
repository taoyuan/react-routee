"use strict";

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, IndexRedirect, Link} from '../../src';

class Tabs extends Router {

  static defaultProps = {contextual: true};

  getRoutes() {
    return <Route path="*" handler={null}/>;
  }

  render() {
    const links = [];
    const routes = [];
    let redirected;

    this.props.tabs.forEach((tab, idx) => {
      var href = '/' + (tab.id || idx);

      if (!redirected) {
        routes.push(<IndexRedirect key={`redirect-${href}`} to={href}/>);
        redirected = true;
      }

      routes.push(<Route key={href} path={href} handler={tab.handler}/>);
      links.push(<Link key={href} href={href}>{tab.name}</Link>);
    });

    return (
      <div>
        <div className="nav">{links}</div>
        <Router stateful contextual className="content">{routes}</Router>
      </div>
    );
  }
}

class Tab1 extends Component {

  render() {
    return (
      <div>
        <div>Tab1</div>
        <input/>
      </div>
    )
  }
}

class Tab2 extends Component {

  render() {
    return (
      <div>
        <div>Tab2</div>
        <input/>
      </div>
    )
  }
}

const tabs = [
  {name: 'Tab 1', handler: Tab1},
  {name: 'Tab 2', handler: Tab2}
];

ReactDOM.render(<Tabs hash tabs={tabs}/>, document.getElementById('container'));
