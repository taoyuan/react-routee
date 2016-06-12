"use strict";

import React, {Component, PropTypes}  from 'react';
import Environment from '../environment';

/**
 * Navigatable
 *
 * A component which operates in context of a router and can
 * navigate to a different route using `navigate(path, navigation, cb)` method.
 */
export default class Navigatable extends Component {

  static contextTypes = {
    router: PropTypes.any
  };

  /**
   * @private
   */
  _getNavigable() {
    return this.context.router || Environment.defaultEnvironment;
  }

  getPath() {
    return this._getNavigable().getPath();
  }

  navigate(path, navigation, cb) {
    return this._getNavigable().navigate(path, navigation, cb);
  }

  makeHref(path) {
    return this._getNavigable().makeHref(path);
  }
}
