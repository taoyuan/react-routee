"use strict";

import React  from 'react';
const assign = Object.assign || require('object-assign');

export default (superclass) => class extends superclass {

  pages = [];

  componentWillUnmount() {
    this.pages = null;
    super.componentWillUnmount && super.componentWillUnmount();
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

  renderRouteHandler(props) {
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
}
