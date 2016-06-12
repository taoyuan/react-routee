/* global describe, it, expect */
import {assert} from 'chai';
import { Router, Route, NotFound, Link } from '../';
import RouterComponent from '../components/Router';
import {Route as RouteComponent, NotFound as NotFoundComponent} from '../components/Route';
import LinkComponent from '../components/Link';

describe('<Router />', () => {
  it('should correctly export all components', () => {
    assert.equal(Router, RouterComponent);
    assert.equal(Route, RouteComponent);
    assert.equal(NotFound, NotFoundComponent);
    assert.equal(Link, LinkComponent);
  });
});
