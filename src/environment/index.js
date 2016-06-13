"use strict";
/**
 * Routing environment.
 *
 * It specifies how routers read its state from DOM and synchronise it back.
 */

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
const DummyEnvironment = require('./DummyEnvironment');
const Environment = require('./Environment');

/**
 * Mixin for routes to keep attached to an environment.
 *
 * This mixin assumes the environment is passed via props.
 */
const Mixin = (superclass) => class extends superclass {
  componentWillMount() {
    super.componentWillMount && super.componentWillMount();
    this.getEnvironment().register(this);
  }

  componentWillUnmount() {
    this.getEnvironment().unregister(this);
    super.componentWillUnmount && super.componentWillUnmount();
  }
};

let PathnameEnvironment;
let HashEnvironment;

let pathnameEnvironment;
let hashEnvironment;
let defaultEnvironment;
let dummyEnvironment;

if (canUseDOM) {

  PathnameEnvironment = require('./PathnameEnvironment');
  HashEnvironment = require('./HashEnvironment');

  pathnameEnvironment = new PathnameEnvironment();
  hashEnvironment = new HashEnvironment();
  defaultEnvironment = (window.history !== undefined &&
  window.history.pushState !== undefined) ?
    pathnameEnvironment :
    hashEnvironment;

} else {

  dummyEnvironment = new DummyEnvironment();
  pathnameEnvironment = dummyEnvironment;
  hashEnvironment = dummyEnvironment;
  defaultEnvironment = dummyEnvironment;

}

module.exports = {
  pathnameEnvironment: pathnameEnvironment,
  hashEnvironment: hashEnvironment,
  defaultEnvironment: defaultEnvironment,
  dummyEnvironment: dummyEnvironment,

  Environment: Environment,
  PathnameEnvironment: PathnameEnvironment,
  HashEnvironment: HashEnvironment,

  Mixin: Mixin
};
