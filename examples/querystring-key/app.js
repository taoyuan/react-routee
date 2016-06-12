"use strict";

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import qs from 'qs';
import {Router, Route, IndexRedirect, Link} from '../../src';
import {HashEnvironment} from '../../src/environment';

class QueryStringKeyEnvironment extends HashEnvironment {
  constructor(key) {
    super();
    this.key = key;
  }

  getPath() {
    var path = super.getPath();
    if (path.indexOf('?') === -1) {
      return '/';
    }
    var query = qs.parse(path.split('?')[1] || '');
    return query[this.key] ? '/' + query[this.key] : '/';
  }

  pushState(path, navigation) {
    path = this.updatedPath(path);
    return super.pushState(path, navigation);
  }

  replaceState(path, navigation) {
    path = this.updatedPath(path);
    return super.replaceState(path, navigation);
  }

  updatedPath(value) {
    const path = super.getPath();
    let query = {};
    if (path.indexOf('?') === -1) {
      query[this.key] = value.slice(1);
      return '/?' + qs.stringify(query);
    } else {
      var splitted = path.split('?');
      query = qs.parse(splitted[1] || '');
      query[this.key] = value.slice(1);
      return splitted[0] + '?' + qs.stringify(query);
    }
  }
}


class Tabs extends Router {

  static defaultProps = {
    contextual: true,
    environment: function() {
      return new QueryStringKeyEnvironment(this.props.routeBy || 'tab')
    }
  };

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
