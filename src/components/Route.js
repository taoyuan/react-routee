"use strict";

import React, {Component, PropTypes} from 'react';
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
  urlPatternOptions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object
  ])
};

class Route extends Component {
  static displayName = 'Route';
  static propTypes = assign({}, ROUTE_PROPS_TYPES);

  static defaultProps = {};

  render() {
    throw new Error(name + " is not meant to be directly rendered.");
  }
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

export {Route, NotFound};

