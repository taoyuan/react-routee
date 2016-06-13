"use strict";

import React, {Component, PropTypes} from 'react';
import {mix} from 'mixwith';
import cx from 'classnames';
import jss from 'js-stylesheet';

import Environment from '../environment';
import matchRoutes from '../helpers/matchRoutes';
import {join, isString, invariant} from '../utils';

const assign = Object.assign || require('object-assign');

let useDefaultStyles = true;

export default class Router extends mix(Component).with(Environment.Mixin) {
  static displayName = 'Router';

  static propTypes = {
    path: PropTypes.string,
    contextual: PropTypes.bool,
    stateful: PropTypes.bool,
    onBeforeNavigation: PropTypes.func,
    onNavigation: PropTypes.func,
    urlPatternOptions: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.object
    ])
  };

  static defaultProps = {
    component: 'div'
  };

  static contextTypes = {
    router: PropTypes.any
  };

  static childContextTypes = {
    router: PropTypes.any
  };

  static setUseDefaultStyles(use) {
    useDefaultStyles = use;
  }

  getChildContext() {
    return {
      router: this
    };
  }

  pages = [];

  componentWillMount() {
    super.componentWillMount && super.componentWillMount();
    if (useDefaultStyles) {
      jss(require('../helpers/styles.js')); // eslint-disable-line global-require
    }
    this.pages = [];

    this.delegateSetRoutingState(this.getRouterState(this.props));
  }

  componentWillReceiveProps(nextProps) {
    var nextState = this.getRouterState(nextProps);
    this.delegateSetRoutingState(nextState);
  }

  componentWillUnmount() {
    this.pages = null;
    super.componentWillUnmount && super.componentWillUnmount();
  }

  getRoutes(props) {
    return props.children;
  }

  getRouterState(props) {
    var path;
    var prefix;

    var parent = props.contextual && this.getParentRouter();

    if (parent) {
      // Build our new path based off the parent. A navigation may be in progress, in which case
      // we as well want the newest data so we use the pending match.
      var parentMatch = parent._pendingMatch || parent.getMatch();

      invariant(
        props.path ||
        isString(parentMatch.unmatchedPath) ||
        parentMatch.matchedPath === parentMatch.path,
        "contextual router has nothing to match on: %s", parentMatch.unmatchedPath
      );

      path = props.path || parentMatch.unmatchedPath || '/';
      prefix = parent.state.prefix + parentMatch.matchedPath;
    } else {

      path = props.path || this.getEnvironment().getPath();

      invariant(
        isString(path),
        ("router operate in environment which cannot provide path, " +
        "pass it a path prop; or probably you want to make it contextual")
      );

      prefix = '';
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    var match = matchRoutes(this.getRoutes(props), path, this.getURLPatternOptions());

    return {
      match: match,
      matchProps: match.getProps(),
      handler: match.getHandler(),
      prefix: prefix,
      navigation: {},
      path: path
    };
  }

  getEnvironment() {
    if (this.props.environment) {
      if (typeof this.props.environment === 'function') {
        return this.props.environment.call(this);
      }
      return this.props.environment;
    }
    if (this.props.hash) {
      return Environment.hashEnvironment;
    }
    if (this.props.contextual && this.context.router) {
      return this.context.router.getEnvironment();
    }
    return Environment.defaultEnvironment;
  }

  /**
   * Return parent router or undefined.
   */
  getParentRouter() {
    var current = this.context.router;
    var environment = this.getEnvironment();

    if (current) {
      if (current.getEnvironment() === environment) {
        return current;
      }
    }
  }

  /**
   * Return current match.
   */
  getMatch() {
    return this.state.match;
  }

  getURLPatternOptions() {
    var parent = this.getParentRouter();
    var parentOptions = parent && parent.getURLPatternOptions();
    // Check existence so we don't return an empty object if there are no options.
    if (parentOptions) {
      return assign({}, this.props.urlPatternOptions, parentOptions);
    }
    return this.props.urlPatternOptions;
  }

  /**
   * Make href scoped for the current router.
   */
  makeHref(href) {
    return join(this.state.prefix, href);
  }

  /**
   * Navigate to a path
   *
   * @param {String} path
   * @param {Function} navigation
   * @param {Function} cb
   */
  navigate(path, navigation, cb) {
    path = join(this.state.prefix, path);
    this.getEnvironment().setPath(path, navigation, cb);
  }

  /**
   * Set new path.
   *
   * This function is called by environment.
   *
   * @private
   *
   * @param {String} path
   * @param {Function} navigation
   * @param {Function} cb
   */
  setPath(path, navigation, cb) {
    var state = this.getRouterState(this.props);
    state.navigation = navigation;

    if (this.props.onBeforeNavigation &&
      this.props.onBeforeNavigation(state.path, navigation, state.match) === false) {
      return;
    }

    if (navigation.onBeforeNavigation &&
      navigation.onBeforeNavigation(state.path, navigation, state.match) === false) {
      return;
    }

    this.delegateSetRoutingState(state, () => {
      if (this.props.onNavigation) {
        this.props.onNavigation(state.path, navigation, state.match);
      }
      cb();
    });
  }

  /**
   * Return the current path
   */
  getPath() {
    return this.state.match.path;
  }

  /**
   * Try to delegate state update to a setRoutingState method (might be provided
   * by router itself) or use replaceState.
   */
  delegateSetRoutingState(state, cb) {
    // Store this here so it can be accessed by child contextual routers in onBeforeNavigation.
    this._pendingMatch = state.match;

    if (this.setRoutingState) {
      this.setRoutingState(state, cb);
    } else {
      this.setState(state, cb);
    }
  }

  getChildProps() {
    var childProps = this.props.childProps || {};
    // Merge up from parents, with inner props taking priority.
    var parent = this.getParentRouter();
    if (parent) {
      childProps = assign({}, parent.getChildProps(), childProps);
    }
    return childProps;
  }

  resolve(props) {
    if (!this.state.match.route) {
      throw new Error("react-routee: No route matched! Did you define a NotFound route?");
    }
    const {stateful} = this.props;
    const {handler, matchProps, match} = this.state;
    const {route} = match;

    let page = stateful && this.pages.find(page => page.props._path === route.props.path);

    if (!page) {
      props = assign({ref: route.ref, _path: route.props.path}, this.getChildProps(), props, matchProps);
      if (React.isValidElement(handler)) {
        // Be sure to keep the props that were already set on the handler.
        // Otherwise, a handler like <div className="foo">bar</div> would have its className lost.
        page = React.cloneElement(handler, assign(props, handler.props));
      } else {
        page = React.createElement(handler, props);
      }
      if (stateful) {
        this.pages.push(page);
      }
    }

    return page;
  }

  render() {
    const page = this.resolve(this.props.childProps);

    if (!this.props.stateful && !this.props.component) {
      return page;
    }

    const pages = this.props.stateful ? this.pages : [page];

    // Pass all props except this component to the Router (containing div/body) and the children,
    // which are swapped out by the route handler.
    var props = assign({}, this.props, {
      className: cx(
        'Router',
        'router',
        this.props.className
      )
    });
    delete props.component;
    delete props.children;
    delete props.childProps;

    const children = pages.map((current, index) => {
      const active = (current.props._path === page.props._path);
      return (
        <div key={index}
             className={cx(
               'route',
               current.props.className,
               {
                 'active': active
               }
             )}>
             {React.cloneElement(current, {active: active})}
        </div>
      )
    });

    return React.createElement(this.props.component, props, children);
  }
}

class Pager extends Router {
  static defaultProps = assign({}, Router.defaultProps, {
    component: 'body'
  });
}

export {Router, Pager};
