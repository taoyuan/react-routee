"use strict";

import React, {Component, PropTypes} from 'react';
import Navigatable from './Navigatable';
const assign = Object.assign || require('object-assign');

const ROUTE_PROPS_TYPES = {
  handler: PropTypes.oneOfType([
    // Can be ReactElement or ReactComponent, unfortunately there is no way to typecheck
    // ReactComponent (that I know of)
    PropTypes.element,
    PropTypes.func
  ]),
  path: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(RegExp)
  ]).isRequired,
  redirect: PropTypes.string,
  urlPatternOptions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object
  ])
};

export default class Route extends Component {
  static displayName = 'Route';
  static propTypes = assign({}, ROUTE_PROPS_TYPES);

  static defaultProps = {};

  render() {
    throw new Error(this.constructor.name + " is not meant to be directly rendered.");
  }
}

class IndexRoute extends Route {
  static defaultProps = {
    path: '/'
  }
}

class Redirect extends Route {
  static propTypes = assign({}, ROUTE_PROPS_TYPES, {
    to: PropTypes.string.isRequired
  });

  static defaultProps = {
    handler: class Redirector extends Navigatable {

      componentDidMount() {
        this.context.router.navigate(this.props.to, (err) => {
          if (err) throw err;
        });
      }

      render() {
        return <div/>;
      }
    }
  };

}

class IndexRedirect extends Redirect {
  static defaultProps = assign({}, Redirect.defaultProps, {
    path: '/'
  });
}


class NotFound extends Route {
  static displayName = 'NotFound';
  static propTypes = assign({}, ROUTE_PROPS_TYPES, {
    path: function (props, propName) {
      if (props[propName]) throw new Error("Don't pass a `path` to NotFound.");
    }
  });

  static defaultProps = {
    path: null
  };
}

export {Route, IndexRoute, Redirect, IndexRedirect, NotFound};

