/* global describe, it, expect */
import {assert} from 'chai';
import {Router, Route, IndexRoute, Redirect, IndexRedirect, NotFound, Link, CaptureClicks} from '../';
import RouterComponent from '../components/Router';
import {
  Route as RouteComponent,
  IndexRoute as IndexRouteComponent,
  Redirect as RedirectComponent,
  IndexRedirect as IndexRedirectComponent,
  NotFound as NotFoundComponent,
} from '../components/Route';
import LinkComponent from '../components/Link';
import CaptureClicksComponent from '../components/CaptureClicks';

describe('<Router />', () => {
  it('should correctly export all components', () => {
    assert.equal(Router, RouterComponent);
    assert.equal(Route, RouteComponent);
    assert.equal(NotFound, NotFoundComponent);
    assert.equal(Link, LinkComponent);
    assert.equal(CaptureClicks, CaptureClicksComponent);
    assert.equal(IndexRoute, IndexRouteComponent);
    assert.equal(Redirect, RedirectComponent);
    assert.equal(IndexRedirect, IndexRedirectComponent);
  });
});
