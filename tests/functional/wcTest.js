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
const parentAfterEnter = stub()
const grandchildAfterEnter = spy()

const parentBeforeLeave = spy()
const grandchildBeforeLeave = stub()
const parentAfterLeave = spy()
const grandchildAfterLeave = stub()

//
const parentBeforeEnterMethod = stub()
const grandchildBeforeEnterMethod = spy()
const parentBeforeLeaveMethod = spy()
const grandchildBeforeLeaveMethod = stub()

class ParentView extends LitElement {
  render () {
    return html`<router-outlet></router-outlet>`
  }

  beforeRouteEnter (...args) {
    return parentBeforeEnterMethod(...args)
  }

  beforeRouteLeave (...args) {
    return parentBeforeLeaveMethod(...args)
  }
}

customElements.define('parent-view', ParentView)

class ChildView extends LitElement {
  static get outlet () {
    return '.outlet'
  }

  createRenderRoot () {
    return this
  }

  render () {
    return html`<div class="outlet"></div>`
  }
}

customElements.define('child-view', ChildView)

class GrandChildView extends LitElement {
  render () {
    return html`Grandchild`
  }

  beforeRouteEnter (...args) {
    return grandchildBeforeEnterMethod(...args)
  }

  beforeRouteLeave (...args) {
    return grandchildBeforeLeaveMethod(...args)
  }
}

customElements.define('grandchild-view', GrandChildView)

class SiblingView extends LitElement {
  render () {
    return html`Sibling`
  }
}

customElements.define('sibling-view', SiblingView)

const LazyParent = function () {
  return new Promise((resolve) => {
    setTimeout(resolve({ default: ParentView, __esModule: true }), 50)
  })
}

const viewMap = {
  lazydynamic: SiblingView,
  lazydynamic2: GrandChildView
}

const LazyDynamic = function (route) {
  return new Promise((resolve) => {
    setTimeout(resolve(viewMap[route.name]), 50)
  })
}

const routes = function (route) {
  route('parent', {
    component: 'parent-view',
    beforeEnter: parentBeforeEnter,
    beforeLeave: parentBeforeLeave,
    afterEnter: parentAfterEnter,
    afterLeave: parentAfterLeave
  }, function () {
    route('child', { component: 'child-view' }, function () {
      route('grandchild', {
        component: 'grandchild-view',
        beforeEnter: grandchildBeforeEnter,
        beforeLeave: grandchildBeforeLeave,
        afterEnter: grandchildAfterEnter,
        afterLeave: grandchildAfterLeave
      })
    })
    route('sibling', { component: 'sibling-view' })
  })
  route('root', { component: ParentView }, function () {
    route('noui', function () {
      route('rootchild', { component: ChildView })
    })
  })
  route('lazy', { component: LazyParent })
  route('lazydynamic', { component: LazyDynamic })
  route('lazydynamic2', { component: LazyDynamic })
}

describe('wc middleware', () => {
  let router, outlet
  beforeEach(() => {
    outlet = document.createElement('div')
    document.body.appendChild(outlet)
    router = new Router({ location: 'memory', outlet, routes })
    router.use(wc)
    router.listen()
  })

  afterEach(() => {
    outlet.remove()
    router.destroy()
  })

  it('should render a root route', async () => {
    await router.transitionTo('parent')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
  })

  it('should accept a HTMLElement constructor as component', async () => {
    await router.transitionTo('root')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
  })

  it('should accept a function that returns a promise as component', async () => {
    await router.transitionTo('lazy')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
  })

  it('should pass route as a parameter to lazy components', async () => {
    await router.transitionTo('lazydynamic')
    expect(outlet).lightDom.to.equal('<sibling-view></sibling-view>')
    await router.transitionTo('lazydynamic2')
    expect(outlet).lightDom.to.equal('<grandchild-view></grandchild-view>')
  })

  it('should render a nested route in shadow dom parent', async () => {
    await router.transitionTo('child')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
    const parentEl = outlet.children[0]
    expect(parentEl).shadowDom.to.equal(`
    <router-outlet>
      <child-view>
        <div class="outlet"></div>
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
        <div class="outlet">
          <grandchild-view></grandchild-view>
        </div>
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

  it('should render a nested route in closest parent with a component', async () => {
    await router.transitionTo('rootchild')
    expect(outlet).lightDom.to.equal('<parent-view></parent-view>')
    const parentEl = outlet.children[0]
    expect(parentEl).shadowDom.to.equal(`
    <router-outlet>
      <child-view>
        <div class="outlet"></div>
      </child-view>
    </router-outlet>`)
  })

  describe('lifecycle', () => {
    beforeEach(() => {
      // route config lifecycle
      parentBeforeEnter.resetHistory()
      parentBeforeEnter.resetBehavior()
      parentAfterEnter.resetHistory()

      grandchildBeforeLeave.resetHistory()
      grandchildBeforeLeave.resetBehavior()
      grandchildAfterLeave.resetHistory()

      grandchildBeforeEnter.resetHistory()
      grandchildAfterEnter.resetHistory()
      parentBeforeLeave.resetHistory()
      parentAfterLeave.resetHistory()

      // component lifecycle
      parentBeforeEnterMethod.resetHistory()
      parentBeforeEnterMethod.resetBehavior()

      grandchildBeforeLeaveMethod.resetHistory()
      grandchildBeforeLeaveMethod.resetBehavior()

      grandchildBeforeEnterMethod.resetHistory()
      parentBeforeLeaveMethod.resetHistory()
    })

    describe('beforeEnter', () => {
      it('should be called when entering a route', async () => {
        const transition = router.transitionTo('parent')
        await transition
        expect(parentBeforeEnter).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all activated routes from parent to child', async () => {
        const transition = router.transitionTo('grandchild')
        await transition
        expect(parentBeforeEnter).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnter).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnter).to.be.calledAfter(parentBeforeEnter)
      })

      it('should call child beforeEnter after parent one is resolved', async () => {
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

      it('should cancel transition when transition.cancel is called inside it', async () => {
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

      it('should cancel transition when returns false', async () => {
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

      it('should not call child beforeEnter when transition is cancelled in parent', async () => {
        parentBeforeEnter.returns(false)
        try {
          await router.transitionTo('grandchild')
        } catch (error) {}
        expect(grandchildBeforeEnter).to.not.be.called
      })

      it('should not be called when route is matched but not activated', async () => {
        await router.transitionTo('child')
        parentBeforeEnter.resetHistory()
        await router.transitionTo('sibling')
        expect(parentBeforeEnter).to.not.be.called
      })
    })

    describe('afterEnter', () => {
      it('should be called when entering a route', async () => {
        const transition = router.transitionTo('parent')
        await transition
        expect(parentAfterEnter).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all activated routes from parent to child', async () => {
        const transition = router.transitionTo('grandchild')
        await transition
        expect(parentAfterEnter).to.be.calledOnceWithExactly(transition)
        expect(grandchildAfterEnter).to.be.calledOnceWithExactly(transition)
        expect(grandchildAfterEnter).to.be.calledAfter(parentAfterEnter)
      })

      it('should not cancel transition when transition.cancel is called inside it', async () => {
        parentAfterEnter.callsFake((transition) => {
          transition.cancel()
        })
        return router.transitionTo('parent')
      })

      it('should not cancel transition when returns false', async () => {
        parentAfterEnter.returns(false)
        return router.transitionTo('parent')
      })

      it('should call child beforeEnter when transition is cancelled in parent', async () => {
        parentAfterEnter.returns(false)
        await router.transitionTo('grandchild')
        expect(grandchildAfterEnter).to.be.called
      })

      it('should not be called when route is matched but not activated', async () => {
        await router.transitionTo('child')
        parentAfterEnter.resetHistory()
        await router.transitionTo('sibling')
        expect(parentAfterEnter).to.not.be.called
      })
    })

    describe('beforeLeave', () => {
      it('should be called when leaving a route', async () => {
        await router.transitionTo('parent')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeave).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all deactivated routes from child to parent', async () => {
        await router.transitionTo('grandchild')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeave).to.be.calledBefore(parentBeforeLeave)
      })

      it('should call parent beforeLeave after child one is resolved', async () => {
        grandchildBeforeLeave.callsFake(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 50)
          })
        })
        await router.transitionTo('grandchild')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeave).to.be.calledBefore(parentBeforeLeave)
      })

      it('should cancel transition when transition.cancel is called inside it', async () => {
        grandchildBeforeLeave.callsFake((transition) => {
          transition.cancel()
        })
        await router.transitionTo('grandchild')
        let fail
        try {
          await router.transitionTo('root')
        } catch (error) {
          fail = error
          expect(error.type).to.equal('TransitionCancelled')
        }
        expect(fail).to.be.ok
      })

      it('should cancel transition when returns false', async () => {
        grandchildBeforeLeave.returns(false)
        await router.transitionTo('grandchild')
        let fail
        try {
          await router.transitionTo('root')
        } catch (error) {
          fail = error
          expect(error.type).to.equal('TransitionCancelled')
        }
        expect(fail).to.be.ok
      })

      it('should not call parent beforeLeave when transition is cancelled in child', async () => {
        grandchildBeforeLeave.returns(false)
        await router.transitionTo('grandchild')
        try {
          await router.transitionTo('root')
        } catch (error) {}
        expect(parentBeforeLeave).to.not.be.called
      })

      it('should not be called when route is matched but not deactivated', async () => {
        await router.transitionTo('child')
        parentBeforeLeave.resetHistory()
        await router.transitionTo('sibling')
        expect(parentBeforeLeave).to.not.be.called
      })
    })

    describe('afterLeave', () => {
      it('should be called when leaving a route', async () => {
        await router.transitionTo('parent')
        const transition = router.transitionTo('root')
        await transition
        expect(parentAfterLeave).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all deactivated routes from child to parent', async () => {
        await router.transitionTo('grandchild')
        const transition = router.transitionTo('root')
        await transition
        expect(parentAfterLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildAfterLeave).to.be.calledOnceWithExactly(transition)
        expect(grandchildAfterLeave).to.be.calledBefore(parentAfterLeave)
      })

      it('should not cancel transition when transition.cancel is called inside it', async () => {
        grandchildAfterLeave.callsFake((transition) => {
          transition.cancel()
        })
        await router.transitionTo('grandchild')
        return router.transitionTo('root')
      })

      it('should not cancel transition when returns false', async () => {
        grandchildAfterLeave.returns(false)
        await router.transitionTo('grandchild')
        return router.transitionTo('root')
      })

      it('should call parent afterLeave when transition is cancelled in child', async () => {
        grandchildAfterLeave.returns(false)
        await router.transitionTo('grandchild')
        await router.transitionTo('root')
        expect(parentAfterLeave).to.be.called
      })

      it('should not be called when route is matched but not deactivated', async () => {
        await router.transitionTo('child')
        parentAfterLeave.resetHistory()
        await router.transitionTo('sibling')
        expect(parentAfterLeave).to.not.be.called
      })
    })

    describe('beforeRouteEnter', () => {
      it('should be called when entering a route', async () => {
        const transition = router.transitionTo('parent')
        await transition
        expect(parentBeforeEnterMethod).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all activated routes from parent to child', async () => {
        const transition = router.transitionTo('grandchild')
        await transition
        expect(parentBeforeEnterMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnterMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnterMethod).to.be.calledAfter(parentBeforeEnterMethod)
      })

      it('should call child beforeRouteEnter after parent one is resolved', async () => {
        parentBeforeEnterMethod.callsFake(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 50)
          })
        })
        const transition = router.transitionTo('grandchild')
        await transition
        expect(parentBeforeEnterMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnterMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeEnterMethod).to.be.calledAfter(parentBeforeEnterMethod)
      })

      it('should cancel transition when transition.cancel is called inside it', async () => {
        parentBeforeEnterMethod.callsFake((transition) => {
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

      it('should cancel transition when returns false', async () => {
        parentBeforeEnterMethod.returns(false)
        let fail
        try {
          await router.transitionTo('parent')
        } catch (error) {
          fail = error
          expect(error.type).to.equal('TransitionCancelled')
        }
        expect(fail).to.be.ok
      })

      it('should not call child beforeRouteEnter when transition is cancelled in parent', async () => {
        parentBeforeEnterMethod.returns(false)
        try {
          await router.transitionTo('grandchild')
        } catch (error) {}
        expect(grandchildBeforeEnter).to.not.be.called
      })

      it('should not be called when route is matched but not activated', async () => {
        await router.transitionTo('child')
        parentBeforeEnterMethod.resetHistory()
        await router.transitionTo('sibling')
        expect(parentBeforeEnterMethod).to.not.be.called
      })
    })

    describe('beforeRouteLeave', () => {
      it('should be called when entering a route', async () => {
        await router.transitionTo('parent')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeaveMethod).to.be.calledOnceWithExactly(transition)
      })

      it('should be called in all activated routes from child to parent', async () => {
        await router.transitionTo('grandchild')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeaveMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeaveMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeaveMethod).to.be.calledBefore(parentBeforeLeaveMethod)
      })

      it('should call parent beforeLeave after child one is resolved', async () => {
        grandchildBeforeLeaveMethod.callsFake(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 50)
          })
        })
        await router.transitionTo('grandchild')
        const transition = router.transitionTo('root')
        await transition
        expect(parentBeforeLeaveMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeaveMethod).to.be.calledOnceWithExactly(transition)
        expect(grandchildBeforeLeaveMethod).to.be.calledBefore(parentBeforeLeaveMethod)
      })

      it('should cancel transition when transition.cancel is called inside it', async () => {
        grandchildBeforeLeaveMethod.callsFake((transition) => {
          transition.cancel()
        })
        await router.transitionTo('grandchild')
        let fail
        try {
          await router.transitionTo('root')
        } catch (error) {
          fail = error
          expect(error.type).to.equal('TransitionCancelled')
        }
        expect(fail).to.be.ok
      })

      it('should cancel transition when returns false', async () => {
        grandchildBeforeLeaveMethod.returns(false)
        await router.transitionTo('grandchild')
        let fail
        try {
          await router.transitionTo('root')
        } catch (error) {
          fail = error
          expect(error.type).to.equal('TransitionCancelled')
        }
        expect(fail).to.be.ok
      })

      it('should not call parent beforeLeave when transition is cancelled in child', async () => {
        grandchildBeforeLeaveMethod.returns(false)
        await router.transitionTo('grandchild')
        try {
          await router.transitionTo('root')
        } catch (error) {}
        expect(parentBeforeLeaveMethod).to.not.be.called
      })

      it('should not be called when route is matched but not deactivated', async () => {
        await router.transitionTo('child')
        parentBeforeLeave.resetHistory()
        await router.transitionTo('sibling')
        expect(parentBeforeLeaveMethod).to.not.be.called
      })
    })
  })
})
