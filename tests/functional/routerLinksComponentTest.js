/* eslint-disable no-unused-expressions */
/* global describe,beforeEach,afterEach,it,$ */

import { Router } from '../../lib/router'
import { wc } from '../../lib/middlewares/wc'
import { routerLinks } from '../../lib/middlewares/router-links'
import { defineCE, expect } from '@open-wc/testing'
import { LitElement, html } from 'lit-element'
import sinon from 'sinon'
import 'jquery'

import '../../lib/components/router-links'

function getQueryCallback(route, el) {
  if (route === 'child') return { foo: 'bar' }
  if (el.id === 'a-rootlink3') return { tag: el.tagName }
}

class ParentView extends LitElement {
  get rootId() {
    return 5
  }

  getParamsCallback = (route) => {
    if (route === 'root') return { id: this.rootId }
  }

  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <router-links .params=${this.getParamsCallback} .query=${getQueryCallback}>
        <div id="div-rootlink1" route="root" param-id="1"></div>
        <div id="div-grandchildlink" route="grandchild" query-name="test"></div>
        <div id="div-parentlink" route="parent"><div id="innerparent"></div></div>
        <div id="div-replace" route="parent" replace></div>
        <a id="a-parentlink" route="parent"></a>
        <a id="a-parentlink-customclass" active-class="my-active-class" route="parent"></a>
        <a id="a-parentlink-noclass" active-class="" route="parent"></a>
        <a id="a-parentlink-exact" route="parent" exact></a>
        <a id="a-grandchildlink" route="grandchild" query-name="test"></a>
        <a id="a-rootlink2" route="root" param-id="2"></a>
        <a id="a-rootlink3" route="root"></a>
        <a id="a-secondrootlink" route="secondroot" param-person-id="2" query-test-value="yyy"></a>
        <a id="a-replace" route="parent" replace></a>
        <a id="a-childlink" route="child" query-name="test"></a>
        <div id="div-a-parent" route="parent">
          <a id="childanchor"></a><a id="childanchor2"></a>
          <div><a id="childanchor3"></a></div>
        </div>
      </router-links>
      <router-outlet></router-outlet>

      <a id="a-parentlink-outside" route="parent"></a>
      <div id="div-parentlink-outside" route="parent"><div id="innerparent-outside"></div></div>
      <router-links param-id="10" query-test="xxx">
        <a id="a-rootlink4" route="root"></a>
      </router-links>
    `
  }
}
const parentTag = defineCE(ParentView)

class ChildView extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html` <router-outlet></router-outlet> `
  }
}
defineCE(ChildView)

class GrandChildView extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <router-links .query=${{ other: 'xx' }}>
        <a id="a-grandchildlink2" route="grandchild" query-name="test"></a>
      </router-links>
    `
  }
}
const grandChildTag = defineCE(GrandChildView)

class BrokenView extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <router-links>
        <a id="a-brokenrootlink" route="root"></a>
        <a id="a-rootlink" route="root" param-id="1"></a>
      </router-links>
    `
  }
}
const brokenTag = defineCE(BrokenView)

describe('router-links', () => {
  let router, outlet, parentComponent
  beforeEach(() => {
    outlet = document.createElement('div')
    document.body.appendChild(outlet)
    const routes = function (route) {
      route('parent', { component: () => parentComponent }, function () {
        route('child', { component: ChildView }, function () {
          route('grandchild', { component: GrandChildView })
        })
      })
      route('root', { path: 'root/:id', component: ParentView })
      route('secondroot', { path: 'secondroot/:personId', component: ParentView })
      route('brokenroot', { path: 'brokenroot', component: BrokenView })
    }
    parentComponent = ParentView
    router = new Router({ location: 'memory', outlet, routes })
    router.use(wc)
    router.use(routerLinks)
    router.listen()
  })

  afterEach(() => {
    outlet.remove()
    router.destroy()
  })

  it('should generate href attributes in anchor tags with route attribute', async function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete

      expect($('#a-parentlink').attr('href')).to.be.equal('/parent')
    })
  })

  it('should use param-* and query-* attributes to generate href', async function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete

      expect($('#a-rootlink2').attr('href')).to.be.equal('/root/2')
      expect($('#a-grandchildlink').attr('href')).to.be.equal('/parent/child/grandchild?name=test')
    })
  })

  it('should convert param-* and query-* attributes from kebab to camel case', async function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete

      expect($('#a-secondrootlink').attr('href')).to.be.equal('/secondroot/2?testValue=yyy')
    })
  })

  it('should update href attributes in anchor tags when attribute is changed', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete

      const rootLink = $('#a-rootlink2')
      const grandChildLink = $('#a-grandchildlink')
      rootLink.attr('param-id', '3')
      grandChildLink.attr('query-other', 'boo')
      // wait for mutation observer
      return Promise.resolve().then(() => {
        expect(rootLink.attr('href')).to.be.equal('/root/3')
        expect(grandChildLink.attr('href')).to.be.equal(
          '/parent/child/grandchild?name=test&other=boo',
        )
      })
    })
  })

  it('should update active class when attribute is changed', function () {
    return router.transitionTo('root', { id: 1 }).then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete

      const rootLink1 = $('#div-rootlink1')
      const rootLink2 = $('#a-rootlink2')

      expect(rootLink1.hasClass('active')).to.be.true
      expect(rootLink2.hasClass('active')).to.be.false
      rootLink1.attr('param-id', '3')
      rootLink2.attr('param-id', '1')
      // wait for mutation observer
      return Promise.resolve().then(() => {
        expect(rootLink1.hasClass('active')).to.be.false
        expect(rootLink2.hasClass('active')).to.be.true
      })
    })
  })

  it('should generate href attributes in first child anchor of a element with route attribute', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      expect($('#childanchor').attr('href')).to.be.equal('/parent')
      expect($('#childanchor2').attr('href')).to.be.equal(undefined)
      expect($('#childanchor3').attr('href')).to.be.equal(undefined)
    })
  })

  it('should use defaults defined in component attributes', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      expect($('#a-rootlink4').attr('href')).to.be.equal('/root/10?test=xxx')
    })
  })

  it('should use defaults defined in component properties', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      expect($('#a-rootlink3').attr('href')).to.be.equal('/root/5?tag=A')
    })
  })

  it('should allow defaults to be defined as a function', function () {
    return router.transitionTo('grandchild').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const grandChildlEl = document.querySelector(grandChildTag)
      await grandChildlEl.updateComplete
      expect($('#a-grandchildlink2').attr('href')).to.be.equal(
        '/parent/child/grandchild?other=xx&name=test',
      )
    })
  })

  it('should call transitionTo when a non anchor tags with route attribute is clicked', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const spy = sinon.spy(router, 'transitionTo')
      $('#div-rootlink1').click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('root', { id: '1' }, {})

      spy.resetHistory()
      $('#div-grandchildlink').click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('grandchild', {}, { name: 'test' })

      spy.resetHistory()
      $('#innerparent').click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
    })
  })

  it('should call transitionTo when a non anchor tags with route attribute with an anchor descendant is clicked', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const spy = sinon.spy(router, 'transitionTo')
      $('#div-a-parent').click()
      expect(spy).to.be.calledOnce
    })
  })

  it('should call transitionTo once when an anchor tag inside a tag with route attribute is clicked', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const spy = sinon.spy(router, 'transitionTo')
      $('#childanchor')[0].click()
      expect(spy).to.be.calledOnce
    })
  })

  it('should call transitionTo when an anchor tag with route attribute is clicked', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const spy = sinon.spy(router, 'transitionTo')
      $('#a-rootlink2')[0].click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('root', { id: '2' }, {})

      spy.resetHistory()
      $('#a-grandchildlink')[0].click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('grandchild', {}, { name: 'test' })

      spy.resetHistory()
      $('#a-parentlink')[0].click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
    })
  })

  it('should call replaceWith when an element with route and replace attribute is clicked', function () {
    return router.transitionTo('parent').then(async function () {
      const spy = sinon.spy(router, 'replaceWith')
      $('#div-replace')[0].click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})

      spy.resetHistory()
      $('#a-replace')[0].click()
      expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
    })
  })

  it('should set active class in tag with route attribute when respective route is active', function () {
    return router
      .transitionTo('parent')
      .then(async function () {
        const parentEl = document.querySelector(parentTag)
        await parentEl.updateComplete
        expect($('#a-parentlink').hasClass('active')).to.be.true
        expect($('#div-parentlink').hasClass('active')).to.be.true
        expect($('#a-rootlink2').hasClass('active')).to.be.false
        expect($('#div-rootlink1').hasClass('active')).to.be.false
        expect($('#a-grandchildlink').hasClass('active')).to.be.false
        expect($('#div-grandchildlink').hasClass('active')).to.be.false
        return router.transitionTo('root', { id: '1' })
      })
      .then(async function () {
        const parentEl = document.querySelector(parentTag)
        await parentEl.updateComplete
        expect($('#a-parentlink').hasClass('active')).to.be.false
        expect($('#div-parentlink').hasClass('active')).to.be.false
        expect($('#a-rootlink2').hasClass('active')).to.be.false
        expect($('#div-rootlink1').hasClass('active')).to.be.true
        expect($('#a-grandchildlink').hasClass('active')).to.be.false
        expect($('#div-grandchildlink').hasClass('active')).to.be.false
        return router.transitionTo('grandchild', null, { name: 'test' })
      })
      .then(async function () {
        const parentEl = document.querySelector(parentTag)
        await parentEl.updateComplete
        const grandChildlEl = document.querySelector(grandChildTag)
        await grandChildlEl.updateComplete
        expect($('#a-parentlink').hasClass('active')).to.be.true
        expect($('#div-parentlink').hasClass('active')).to.be.true
        expect($('#a-rootlink2').hasClass('active')).to.be.false
        expect($('#div-rootlink1').hasClass('active')).to.be.false
        expect($('#a-grandchildlink').hasClass('active')).to.be.true
        expect($('#div-grandchildlink').hasClass('active')).to.be.true
      })
  })

  it('should allow to customize the class to be set', function () {
    return router.transitionTo('parent').then(async function () {
      expect($('#a-parentlink-customclass').hasClass('active')).to.be.false
      expect($('#a-parentlink-customclass').hasClass('my-active-class')).to.be.true
    })
  })

  it('should allow to avoid a class being set', function () {
    return router.transitionTo('parent').then(async function () {
      expect($('#a-parentlink-noclass').hasClass('active')).to.be.false
    })
  })

  it('should do an exact active matching when exact attribute is set', async function () {
    await router.transitionTo('parent')
    expect($('#a-parentlink-exact').hasClass('active')).to.be.true
    await router.transitionTo('grandchild')
    expect($('#a-parentlink-exact').hasClass('active')).to.be.false
  })

  it('should not generate href attributes outside of elements with routerlinks attribute', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      expect($('#a-parentlink-outside').attr('href')).to.be.equal(undefined)
    })
  })

  it('should not call transitionTo outside of elements with routerlinks attribute', function () {
    return router.transitionTo('parent').then(async function () {
      const parentEl = document.querySelector(parentTag)
      await parentEl.updateComplete
      const spy = sinon.spy(router, 'transitionTo')
      $('#innerparent-outside').click()
      expect(spy).to.not.be.called
    })
  })

  it('should generate href even if there is a broken link configuration', function () {
    return router.transitionTo('brokenroot').then(async function () {
      const brokenEl = document.querySelector(brokenTag)
      await brokenEl.updateComplete
      expect($('#a-rootlink').attr('href')).to.be.equal('/root/1')
    })
  })

  describe('when elements are added dynamically', () => {
    it('should generate href attributes in anchor tags with route attribute', function (done) {
      router.transitionTo('parent').then(async function () {
        const parentEl = document.querySelector(parentTag)
        await parentEl.updateComplete
        $(`<div>
            <a id="a-dyn-rootlink2" route="root" param-id="2"></a>
            <a id="a-dyn-parentlink" route="parent"></a>
            <a id="a-dyn-grandchildlink" route="grandchild" query-name="test"></a>
          </div> 
        `).appendTo(parentEl.renderRoot.querySelector('router-links'))

        // links are updated asynchronously by MutationObserver
        setTimeout(() => {
          expect($('#a-dyn-parentlink').attr('href')).to.be.equal('/parent')
          expect($('#a-dyn-rootlink2').attr('href')).to.be.equal('/root/2')
          expect($('#a-dyn-grandchildlink').attr('href')).to.be.equal(
            '/parent/child/grandchild?name=test',
          )
          done()
        }, 0)
      })
    })

    it('should call transitionTo when a non anchor tags with route attribute is clicked', function () {
      return router.transitionTo('parent').then(async function () {
        const parentEl = document.querySelector(parentTag)
        await parentEl.updateComplete

        $(`<div id="div-dyn-rootlink1" route="root" param-id="1"></div>
        <div id="div-dyn-grandchildlink" route="grandchild" query-name="test"></div>
        <div id="div-dyn-parentlink" route="parent"><div id="dyn-innerparent"></div></div>
        `).appendTo(parentEl.renderRoot.querySelector('router-links'))

        const spy = sinon.spy(router, 'transitionTo')
        $('#div-dyn-rootlink1').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('root', { id: '1' }, {})

        spy.resetHistory()
        $('#div-dyn-grandchildlink').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('grandchild', {}, { name: 'test' })

        spy.resetHistory()
        $('#dyn-innerparent').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
      })
    })
  })
})
