/* eslint-disable no-return-assign, no-unused-expressions */
import { LitElement, html } from 'lit-element'
import 'chai/chai.js'
import { Router } from '../../lib/router'
import { wc } from '../../lib/middlewares/wc'
import { expect } from '@open-wc/testing'
import { spy, stub } from 'sinon'

const { describe, it, beforeEach, afterEach } = window

const parentBeforeEnter = stub()
const grandchildBeforeEnter = spy()
const parentBeforeLeave = spy()
const grandchildBeforeLeave = spy()

class ParentView extends LitElement {
  render () {
    return html`<router-outlet></router-outlet>`
  }
}

customElements.define('parent-view', ParentView)

class ChildView extends LitElement {
  createRenderRoot () {
    return this
  }

  render () {
    return html`<router-outlet></router-outlet>`
  }
}

customElements.define('child-view', ChildView)

class GrandChildView extends LitElement {
  render () {
    return html`Grandchild`
  }
}

customElements.define('grandchild-view', GrandChildView)

class SiblingView extends LitElement {
  render () {
    return html`Sibling`
  }
}

customElements.define('sibling-view', SiblingView)

const routes = function (route) {
  route('parent', { component: 'parent-view', beforeEnter: parentBeforeEnter, beforeLeave: parentBeforeLeave }, function () {
    route('child', { component: 'child-view' }, function () {
      route('grandchild', { component: 'grandchild-view', beforeEnter: grandchildBeforeEnter, beforeLeave: grandchildBeforeLeave })
    })
    route('sibling', { component: 'sibling-view' })
  })
  route('root', { component: 'parent-view' })
}

describe('wc middleware', () => {
  let router, outlet
  beforeEach(() => {
    outlet = document.createElement('div')
    document.body.appendChild(outlet)
    router = new Router({ location: 'memory', outlet, routes })
    wc.create(router)
    router.use(wc)
    router.listen()
  })

  afterEach(() => {
    outlet.remove()
    wc.destroy(router)
    router.destroy()
  })

  it('should render a root route', async () => {
    await router.transitionTo('parent')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
  })

  it('should render a nested route in shadow dom parent', async () => {
    await router.transitionTo('child')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
    const parentEl = outlet.children[0]
    expect(parentEl).shadowDom.to.equal(`
    <router-outlet>
      <child-view>
        <router-outlet></router-outlet>
      </child-view>
    </router-outlet>`)
  })

  it('should render a nested route in light dom parent', async () => {
    await router.transitionTo('grandchild')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
    const parentEl = outlet.children[0]
    expect(parentEl).shadowDom.to.equal(`
    <router-outlet>
      <child-view>
        <router-outlet>
         <grandchild-view></grandchild-view>
        </router-outlet>
      </child-view>
    </router-outlet>`)
  })

  it('should swap the element when transitioning from a sibling route', async () => {
    await router.transitionTo('child')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
    await router.transitionTo('sibling')
    const parentEl = outlet.children[0]
    expect(parentEl).shadowDom.to.equal(`
    <router-outlet>
      <sibling-view>
      </sibling-view>
    </router-outlet>`)
  })

  describe('hooks', () => {
    beforeEach(() => {
      parentBeforeEnter.resetHistory()
      parentBeforeEnter.resetBehavior()

      grandchildBeforeEnter.resetHistory()
      parentBeforeLeave.resetHistory()
      grandchildBeforeLeave.resetHistory()
    })

    it('should call beforeEnter hook when entering a route', async () => {
      const transition = router.transitionTo('parent')
      await transition
      expect(parentBeforeEnter).to.be.calledOnceWithExactly(transition)
    })

    it('should call beforeEnter hook in all activated routes from parent to child', async () => {
      const transition = router.transitionTo('grandchild')
      await transition
      expect(parentBeforeEnter).to.be.calledOnceWithExactly(transition)
      expect(grandchildBeforeEnter).to.be.calledOnceWithExactly(transition)
      expect(grandchildBeforeEnter).to.be.calledAfter(parentBeforeEnter)
    })

    it('should call child beforeEnter hook after parent is resolved', async () => {
      parentBeforeEnter.callsFake(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 50)
        })
      })
      const transition = router.transitionTo('grandchild')
      await transition
      expect(parentBeforeEnter).to.be.calledOnceWithExactly(transition)
      expect(grandchildBeforeEnter).to.be.calledOnceWithExactly(transition)
      expect(grandchildBeforeEnter).to.be.calledAfter(parentBeforeEnter)
    })

    it('should cancel transition when transition cancel is called in beforeEnter', async () => {
      parentBeforeEnter.callsFake((transition) => {
        transition.cancel()
      })
      let fail
      try {
        await router.transitionTo('parent')
      } catch (error) {
        fail = error
        expect(error.type).to.equal('TransitionCancelled')
      }
      expect(fail).to.be.ok
    })

    it('should cancel transition when beforeEnter returns false', async () => {
      parentBeforeEnter.returns(false)
      let fail
      try {
        await router.transitionTo('parent')
      } catch (error) {
        fail = error
        expect(error.type).to.equal('TransitionCancelled')
      }
      expect(fail).to.be.ok
    })

    it('should not call child beforeEnter hook when transition is cancelled in parent', async () => {
      parentBeforeEnter.returns(false)
      try {
        await router.transitionTo('grandchild')
      } catch (error) {}
      expect(grandchildBeforeEnter).to.not.be.called
    })

    it('should not call beforeEnter hook when route is matched but not activated', async () => {
      await router.transitionTo('child')
      parentBeforeEnter.resetHistory()
      await router.transitionTo('sibling')
      expect(parentBeforeEnter).to.not.be.called
    })
  })
})
