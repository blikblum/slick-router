/* eslint-disable no-unused-expressions */
/* global describe,beforeEach,afterEach,it,$ */

import { Router } from '../../lib/router'
import { wc } from '../../lib/middlewares/wc'
import { routerLinks, bindRouterLinks } from '../../lib/middlewares/router-links'
import { defineCE, expect, fixtureSync } from '@open-wc/testing'
import { LitElement, html } from 'lit'
import sinon from 'sinon'
import 'jquery'

class ParentView extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <div>
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
        <router-outlet></router-outlet>
      </div>
      <a id="a-parentlink-outside" route="parent"></a>
      <div id="div-parentlink-outside" route="parent"><div id="innerparent-outside"></div></div>
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

describe('bindRouterLinks', () => {
  let router, outlet, parentComponent
  beforeEach(() => {
    outlet = document.createElement('div')
    document.body.appendChild(outlet)
    const routes = function (route) {
      route('parent', { component: () => parentComponent }, function () {
        route('child', { component: ChildView }, function () {
          route('grandchild', { component: ParentView })
        })
      })
      route('root', { path: 'root/:id', component: ParentView })
      route('secondroot', { path: 'secondroot/:personId', component: ParentView })
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

  describe('when calling bindRouterLinks in pre-rendered HTML', function () {
    let unbind, preRenderedEl
    beforeEach(function () {
      preRenderedEl = fixtureSync(`<div id="prerendered">
        <div>
          <a id="a-prerootlink2" route="root" param-id="2"></a>
          <a id="a-preparentlink" route="parent"></a>
          <a id="a-pregrandchildlink" route="grandchild" query-name="test"></a>
          <div id="div-prerootlink1" route="root" param-id="1"></div>
          <div id="div-pregrandchildlink" route="grandchild" query-name="test"></div>
          <div id="div-preparentlink" route="parent"><div id="preinnerparent"></div></div>
        </div>
      </div>`)
      unbind = bindRouterLinks(preRenderedEl)
    })

    it('should generate href attributes in anchor tags with route attribute', function () {
      return router.transitionTo('parent').then(async function () {
        expect($('#a-preparentlink').attr('href')).to.be.equal('/parent')
        expect($('#a-prerootlink2').attr('href')).to.be.equal('/root/2')
        expect($('#a-pregrandchildlink').attr('href')).to.be.equal(
          '/parent/child/grandchild?name=test',
        )
      })
    })

    it('should set active class in tags with route attribute', function () {
      return router.transitionTo('parent').then(async function () {
        expect($('#a-preparentlink').hasClass('active')).to.be.true
        expect($('#a-prerootlink2').hasClass('active')).to.be.false
        expect($('#div-preparentlink').hasClass('active')).to.be.true
        expect($('#div-prerootlink1').hasClass('active')).to.be.false
      })
    })

    it('should call transitionTo when a non anchor tags with route attribute is clicked', function () {
      return router.transitionTo('parent').then(async function () {
        const spy = sinon.spy(router, 'transitionTo')
        $('#div-prerootlink1').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('root', { id: '1' }, {})

        spy.resetHistory()
        $('#div-pregrandchildlink').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('grandchild', {}, { name: 'test' })

        spy.resetHistory()
        $('#preinnerparent').click()
        expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
      })
    })

    it('should not call transitionTo after calling function returned by bindRouterLinks', function () {
      unbind()
      return router.transitionTo('parent').then(async function () {
        const spy = sinon.spy(router, 'transitionTo')
        $('#div-prerootlink1').click()
        $('#div-pregrandchildlink').click()
        $('#preinnerparent').click()
        expect(spy).to.not.be.called
      })
    })

    describe('and nodes are added dynamically', () => {
      it('should generate href attributes in anchor tags with route attribute', function (done) {
        router.transitionTo('parent').then(async function () {
          const parentEl = document.querySelector(parentTag)
          await parentEl.updateComplete
          $(`<a id="a-dyn-prerootlink2" route="root" param-id="2"></a>
            <a id="a-dyn-preparentlink" route="parent"></a>
            <a id="a-dyn-pregrandchildlink" route="grandchild" query-name="test"></a>
          `).appendTo(document.querySelector('#prerendered'))

          // links are updated asynchronously by MutationObserver
          setTimeout(() => {
            expect($('#a-dyn-preparentlink').attr('href')).to.be.equal('/parent')
            expect($('#a-dyn-prerootlink2').attr('href')).to.be.equal('/root/2')
            expect($('#a-dyn-pregrandchildlink').attr('href')).to.be.equal(
              '/parent/child/grandchild?name=test',
            )
            done()
          }, 0)
        })
      })

      it('should set active class in tags with route attribute', function (done) {
        router.transitionTo('parent').then(async function () {
          const parentEl = document.querySelector(parentTag)
          await parentEl.updateComplete
          $(`<a id="a-dyn-prerootlink2" route="root" param-id="2"></a>
            <a id="a-dyn-preparentlink" route="parent"></a>
            <a id="a-dyn-pregrandchildlink" route="grandchild" query-name="test"></a>
          `).appendTo(document.querySelector('#prerendered'))

          // links are updated asynchronously by MutationObserver
          setTimeout(() => {
            expect($('#a-dyn-preparentlink').hasClass('active')).to.be.true
            expect($('#a-dyn-prerootlink2').hasClass('active')).to.be.false
            expect($('#a-dyn-pregrandchildlink').hasClass('active')).to.be.false
            done()
          }, 0)
        })
      })
    })
  })

  describe('with custom event', function () {
    let unbindCustomEvent
    beforeEach(function () {
      unbindCustomEvent = bindRouterLinks(document.body, { event: 'custom-event' })
    })

    afterEach(function () {
      unbindCustomEvent()
    })

    it('should call transitionTo when a non anchor tags with route attribute is clicked', function () {
      return router.transitionTo('parent').then(async function () {
        const spy = sinon.spy(router, 'transitionTo')
        const event = new CustomEvent('custom-event', { bubbles: true })

        $('#div-rootlink1')[0].dispatchEvent(event)
        expect(spy).to.be.calledOnce.and.calledWithExactly('root', { id: '1' }, {})

        spy.resetHistory()
        $('#div-grandchildlink')[0].dispatchEvent(event)
        expect(spy).to.be.calledOnce.and.calledWithExactly('grandchild', {}, { name: 'test' })

        spy.resetHistory()
        $('#innerparent')[0].dispatchEvent(event)
        expect(spy).to.be.calledOnce.and.calledWithExactly('parent', {}, {})
      })
    })
  })
})
