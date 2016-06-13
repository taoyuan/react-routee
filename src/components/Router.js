"use strict";

import React, {Component} from 'react';
import mixin from 'react-mixin';
import cx from 'classnames';
import jss from 'js-stylesheet';

import RouterMixin from '../mixins/RouterMixin';
import RouterRenderingMixin from '../mixins/RouterRenderingMixin';

const assign = Object.assign || require('object-assign');

let useDefaultStyles = true;
let defaultStylesImported;

export default class Router extends Component {
  static defaultProps = {
    component: 'div'
  };

  static setUseDefaultStyles(use) {
    useDefaultStyles = use;
  }

  componentWillMount() {
    if (useDefaultStyles && !defaultStylesImported) {
      jss(require('../helpers/styles.js')); // eslint-disable-line global-require
      defaultStylesImported = true;
    }
  }

  render() {
    const page = this.renderRouteHandler(this.props.childProps);

    if (!this.props.stateful && !this.props.component) {
      return page;
    }

    const pages = this.props.stateful ? this.pages : [page];

    // Pass all props except this component to the Router (containing div/body) and the children,
    // which are swapped out by the route handler.
    var props = assign({}, this.props, {
      className: cx(
        'RouteeRouter',
        'routee-router',
        this.props.className
      )
    });
    delete props.component;
    delete props.children;
    delete props.childProps;

    const children = pages.map((current) => {
      const active = (current.props._path === page.props._path);
      return (
        <div key={current.props._path}
             className={cx(
               'routee-route',
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

mixin.onClass(Router, RouterMixin);
mixin.onClass(Router, RouterRenderingMixin);

class Pager extends Router {
  static defaultProps = assign({}, Router.defaultProps, {
    component: 'body'
  });
}

export {Router, Pager};
