import {assert} from 'chai';
import {shallow, render} from 'enzyme';
import React from 'react';
import {Link, Route, Router, Pager, NotFound} from '../../index';

describe('react-router-component (on server)', () => {

  describe('basic rendering', () => {
    class rendersSlug extends React.Component {
      render() {
        return <div>
          {this.props.slug}
        </div>;
      }
    }
    class rendersFirstMatch extends React.Component {
      render() {
        return <div>
          {this.props._[0]}
        </div>;
      }
    }
    class rendersMatches extends React.Component {
      render() {
        return <div>
          {this.props.match1 + this.props.match2}
        </div>;
      }
    }
    class App extends React.Component {
      render() {
        return <Router className="App" path={this.props.path}>
          <Route path="/" handler={<div>mainpage</div>}/>
          <Route path="/x/:slug" handler={rendersSlug}/>
          <Route path={/\/y(.*)/} handler={rendersFirstMatch}/>
          <Route path={/\/z\/(.*)\/(.*)/}
                 urlPatternOptions={['match1', 'match2']}
                 handler={rendersMatches}/>
          <NotFound handler={<div>not_found</div>}/>
        </Router>;
      }
    }

    it('renders to /', () => {
      const wrapper = render(<App path="/"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'mainpage');
    });

    it('renders to /:slug', () => {
      const wrapper = render(<App path="/x/hello"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'hello');
    });

    it('renders with regex', () => {
      const wrapper = render(<App path="/y/ohhai"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'ohhai');
    });

    it('renders with regex and urlPatternOptions(matchKeys)', () => {
      const wrapper = render(<App path="/z/one/two"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'onetwo');
    });

    it('renders to empty on notfound', () => {
      const wrapper = render(<App path="/notfound"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'not_found');
    });
  });

  describe('pager router', () => {
    class App extends React.Component {
      render() {
        return <Pager className="App" path={this.props.path}>
          <Route path="/" handler={<div>mainpage</div>}/>
        </Pager>;
      }
    }

    it('renders to <body>', () => {
      const wrapper = shallow(<App path="/"/>);
      assert(wrapper.find('body'));
    });
  });

  describe('Custom Component', () => {
    class AppSection extends React.Component {
      render() {
        return <Router className="App" path={this.props.path} component="section">
          <Route path="/" handler={<div>mainpage</div>}/>
        </Router>;
      }
    }

    class AppNoWrapper extends React.Component {
      render() {
        return <Router className="App" path={this.props.path} component={null}>
          <Route path="/" handler={<div>mainpage</div>}/>
        </Router>;
      }
    }

    it('renders to <section>', () => {
      const wrapper = render(<AppSection path="/"/>);
      assert(wrapper.find('section'));
    });

    it('removes wrapper with falsy value', () => {
      const wrapper = render(<AppNoWrapper path="/"/>);
      assert(wrapper.find(<div>mainpage</div>));
    });
  });

  describe('contextual router', () => {
    class rendersSubSlug extends React.Component {
      render() {
        return <Link href={'/sup-' + this.props.subslug}/>;
      }
    }
    class ContextualRouter extends React.Component {
      render() {
        return (
          <Router className="X" contextual={true}>
            <Route path="/hello" handler={<Link href="/hi"/>}/>
            <Route path="/hello2" handler={<Link href="/hi" global={true}/>}/>
            <Route path="/hello3/*" handler={(
              <Router className="Y" contextual={true}>
                <Route path="/:subslug" handler={rendersSubSlug}/>
              </Router>
            )}/>
          </Router>
        )
      }
    }

    class App extends React.Component {
      render() {
        return <Router className="App" path={this.props.path}>
          <Route path="/x/:slug/*" handler={ContextualRouter}/>
        </Router>;
      }
    }

    it('renders Link component with href scoped to its prefix', () => {
      const wrapper = render(<App path="/x/nice/hello"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.X').length);
      assert.include(wrapper.html(), 'href="/x/nice/hi"');
    });

    it('renders global Link component with correct href (not scoped to a router)', () => {
      const wrapper = render(<App path="/x/nice/hello2"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.X').length);
      assert.include(wrapper.html(), 'href="/hi"');
    });

    it('renders Link component with href scoped to its nested context prefix', () => {
      const wrapper = render(<App path="/x/nice/hello3/welcome"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.X').length);
      assert(wrapper.find('.Y').length);
      assert.include(wrapper.html(), 'href="/x/nice/hello3/sup-welcome"');
    });
  });

  describe('nested contextual routers', () => {
    class RendersLinkSlug extends React.Component {
      render() {
        return <Link global={true} href="/hi" data-slug={this.props.slug}/>;
      }
    }
    class Level2 extends React.Component {
      render() {
        var thisSlug = this.props.slug;
        return <Router className="L2" contextual={true}>
          <Route path="/" handler={<Link href="/hello" data-slug={thisSlug}/>}/>
          <Route path="/:slug" handler={RendersLinkSlug}/>
        </Router>;
      }
    }

    class Level1 extends React.Component {
      render() {
        var thisSlug = this.props.slug;
        return <Router className="L1" contextual={true}>
          <Route path="/" handler={<Link href="/l2" data-slug={thisSlug}/>}/>
          <Route path="/:slug(/*)" handler={Level2}/>
        </Router>;
      }
    }

    class App extends React.Component {
      render() {
        return <Router className="App" path={this.props.path}>
          <Route path="/l1/:slug(/*)" handler={Level1}/>
        </Router>;
      }
    }

    it('renders Link component with href scoped to its prefix', () => {
      const wrapper = render(<App path="/l1/nice"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.L1').length);
      assert.include(wrapper.html(), 'href="/l1/nice/l2"');
      assert.include(wrapper.html(), 'data-slug="nice"');
    });

    it('renders Link component with href scoped to its prefix - trailing slash', () => {
      const wrapper = render(<App path="/l1/nice/"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.L1').length);
      assert.include(wrapper.html(), 'href="/l1/nice/l2"');
      assert.include(wrapper.html(), 'data-slug="nice"');
    });

    it('renders nested Link component with href scoped to its prefix', () => {
      const wrapper = render(<App path="/l1/nice/l2"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.L1').length);
      assert(wrapper.find('.L2').length);
      assert.include(wrapper.html(), 'href="/l1/nice/l2/hello"');
      assert.include(wrapper.html(), 'data-slug="l2"');
    });

    it('renders global Link component with correct href (not scoped to a router)', () => {
      const wrapper = render(<App path="/l1/nice/l2/foo"/>);
      assert(wrapper.find('.App').length);
      assert(wrapper.find('.L2').length);
      assert.include(wrapper.html(), 'href="/hi"');
      assert.include(wrapper.html(), 'data-slug="foo"');
    });
  });

  describe('context passing', () => {
    class Inner extends React.Component {
      render() {
        assert(this.context.flux && this.context.flux.key);
        return <div>
          {this.context.flux.key}
        </div>;
      }
    }

    Inner.contextTypes = {
      flux: React.PropTypes.object
    };

    Inner.displayName = 'Inner';

    class App extends React.Component {
      getChildContext() {
        return {
          flux: {
            key: 'flux_value'
          }
        };
      }

      getRoutes() {
        return [
          <Route path="/" handler={Inner}/>,
          <Route path="/blargh" handler={<div>wrong way</div>}/>,
          <NotFound handler={<div>not found</div>}/>
        ];
      }

      render() {
        var routes = this.getRoutes();

        return <div className="App">
          <div>
            <Router path={this.props.path} children={routes}/>
          </div>
        </div>;
      }
    }

    App.childContextTypes = {
      flux: React.PropTypes.object
    };

    it('renders to / with context intact', () => {
      const wrapper = render(<App path="/"/>);
      assert(wrapper.find('.App').length);
      assert.include(wrapper.text(), 'flux_value');
    });
  });

  describe('urlPatternOptions hierarchy', () => {
    class Inner extends React.Component {
      render() {
        return <div>
          {this.props.foo + '|' + this.props.bar + this.props._}
        </div>;
      }
    }

    Inner.displayName = 'Inner';

    class App extends React.Component {
      getRoutes() {
        return [
          <Route path="/1/$foo/$bar" handler={Inner}/>,
          <Route path="/2/$foo/$bar"
                 handler={Inner}
                 urlPatternOptions={{segmentValueCharset: 'A-Z'}}/>,
          <Route path="/3/!foo/!bar"
                 handler={Inner}
                 urlPatternOptions={{segmentNameStartChar: '!'}}/>,
          <Route path="/4/[foo]?"
                 handler={Inner}
                 urlPatternOptions={{optionalSegmentStartChar: '[', optionalSegmentEndChar: ']'}}/>,
          <NotFound handler={<div>not found</div>}/>
        ];
      }

      render() {
        return <div className="App">
          <Router path={this.props.path} urlPatternOptions={{wildcardChar: '?'}}>
            <Route path="/start?" handler={<div>
              <Router contextual={true}
                      children={this.getRoutes()}
                      urlPatternOptions={{segmentNameStartChar: '$'}}/>
            </div>}/>
            <NotFound handler={<div>not found</div>}/>
          </Router>
        </div>;
      }
    }

    it('passes urlPatternOptions from parent <Router>', () => {
      const wrapper = render(<App path="/start/1/biff/baz"/>);
      assert.include(wrapper.text(), 'biff\|baz');
    });

    it('merges urlPatternOptions from parent <Router> and a <Route>', () => {
      let wrapper = render(<App path="/start/2/BIFF/BA"/>);
      assert.include(wrapper.text(), 'BIFF\|BA');
      wrapper = render(<App path="/start/2/biff/ba"/>);
      assert.include(wrapper.text(), 'not found');
    });

    it('gives urlPatternOptions on route precedence over router', () => {
      const wrapper = render(<App path="/start/3/biff/boff"/>);
      assert.include(wrapper.text(), 'biff\|boff');
    });

    it('inherits from parent contextual router', () => {
      const wrapper = render(<App path="/start/4/foobar"/>);
      assert.include(wrapper.text(), 'undefined\|undefinedbar');
    });
  });

  describe('props on router (childProps)', () => {
    class App extends React.Component {
      render() {
        return (
          <Router className="X" childProps={{className: "A", 'data-from-first': 'A'}} path={this.props.path}>
            <Route path="/" handler={<div>mainpage</div>}/>
            <Route path="/hasclassname" handler={<div className="ownClassname"/>}/>
            <Route path="/nested/*" handler={
              <Router className="Y" data-own-prop={true} contextual={true}
                      childProps={{className: "B", 'data-from-second': 'B'}}>
                <Route path="/foo" handler={<div>foo</div>}/>
                      {/* Rabbit hole it */}
                <Route path="/nestedAgain/*" handler={
                  <Router className="Z" data-own-prop={true} contextual={true}
                          childProps={{className: "C", 'data-from-third': 'C'}}>
                    <Route path="/bar" handler={<div>bar</div>}/>
                  </Router>}
                />
              </Router>}/>
          </Router>
        );
      }
    }

    it('passes className', () => {
      const wrapper = render(<App path="/"/>);
      assert.equal(wrapper.text(), 'mainpage');
    });

    it('does not override child classname', () => {
      const wrapper = render(<App path="/hasclassname"/>);
      assert.include(wrapper.html(), 'ownClassname');
    });

    it('passes childProps to contextual children, but inner childProps have priority', () => {
      const wrapper = render(<App path="/nested/foo"/>);
      assert.equal(wrapper.text(), 'foo');
    });

    it('keeps going and going', () => {
      const wrapper = render(<App path="/nested/nestedAgain/bar"/>);
      assert.equal(wrapper.text(), 'bar');
    });
  });

});
