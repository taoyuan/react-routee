"use strict";

import React, {PropTypes} from 'react';
import urllite from 'urllite/lib/core';
import Environment from '../environment';
import HashEnvironment from '../environment/HashEnvironment';
var assign = Object.assign || require('object-assign');

/**
 * A container component which captures <a> clicks and, if there's a matching
 * route defined, routes them.
 */
export default class CaptureClicks extends React.Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    environment: PropTypes.object
  };

  static defaultProps = {
    component: React.DOM.div,
    environment: Environment.defaultEnvironment,
    gotoURL(url) {
      // We should really just be allowing the event's default action, be we
      // can't make the decision to do that synchronously.
      window.location.href = url;
    }
  };

  onClick(e) {
    if (this.props.onClick) {
      var shouldProceed = this.props.onClick(e);
      if (shouldProceed === false) return;
    }

    // Ignore canceled events, modified clicks, and right clicks.
    if (e.defaultPrevented) {
      return;
    }

    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    if (e.button !== 0) {
      return;
    }

    // Get the <a> element.
    var el = e.target;
    while (el && el.nodeName !== 'A') {
      el = el.parentNode;
    }

    // Ignore clicks from non-a elements.
    if (!el) {
      return;
    }

    // Ignore the click if the element has a target.
    if (el.target && el.target !== '_self') {
      return;
    }

    // Ignore the click if it's a download link. (We use this method of
    // detecting the presence of the attribute for old IE versions.)
    if (el.attributes.download) {
      return;
    }

    // Ignore hash (used often instead of javascript:void(0) in strict CSP envs)
    if (el.getAttribute('href') === '#' && !(this.props.environment instanceof HashEnvironment)) {
      return;
    }

    // Use a regular expression to parse URLs instead of relying on the browser
    // to do it for us (because IE).
    var url = urllite(el.href);
    var windowURL = urllite(window.location.href);

    // Ignore links that don't share a protocol and host with ours.
    if (url.protocol !== windowURL.protocol || url.host !== windowURL.host) {
      return;
    }

    // Ignore 'rel="external"' links.
    if (el.rel && /(?:^|\s+)external(?:\s+|$)/.test(el.rel)) {
      return;
    }

    // Prevent :focus from sticking; preventDefault() stops blur in some browsers
    el.blur();
    e.preventDefault();

    // flag if we already found a "not found" case and bailed
    var bail = false;

    const onBeforeNavigation = (path, navigation, match) => {
      if (bail) {
        return false;
      } else if (!match || !match.match) {
        bail = true;
        this.props.gotoURL(el.href);
        return false;
      }
    };

    this.props.environment.navigate(
      url.pathname + (url.hash.length > 1 ? url.hash : ''),
      {onBeforeNavigation: onBeforeNavigation},
      (err, info) => {
        if (err) throw err;
      });
  };

  render() {
    var props = assign({}, this.props, {
      onClick: this.onClick
    });
    return this.props.component(props, this.props.children);
  }

}
