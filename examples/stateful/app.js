'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link} from '../../src';

const views = [1, 2, 3, 4, 5];

class Master extends React.Component {

  render() {
    var links = views.map((item, index) =>
      <li key={index}>
        <Link href={`/${item}`}>Item {item}</Link>
      </li>
    );
    return <ul>{links}</ul>;
  }
}

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.time = new Date();
  }

  render() {
    const {time} = this;
    return (
      <div>
        <p>Detailed info for item: {this.props.item}</p>
        <p>Created at: {time.toString()}</p>
        <input/>
      </div>
    );
  }
}

class Page extends React.Component {

  render() {
    return (
      <div>
        <Master />
        {this.props.item && <Detail item={this.props.item}/>}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Master-detail with react-router-component</h1>
        <Router stateful hash>
          <Route path="/" handler={Page}/>
          {views.map((item) => <Route key={item} path={`/${item}`} item={item} handler={Page}/>)}
        </Router>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('container'));
