/* eslint-disable no-unused-expressions */

import 'chai/chai.js'
import { Router } from '../../lib/router'
import { events } from '../../lib/middlewares/events'
import { expect } from '@open-wc/testing'
import { spy } from 'sinon'

const { describe, it, beforeEach, afterEach } = window

describe('events middleware', () => {
  const routes = (route) => {
    route('application', () => {
      route('notifications')
      route('messages')
      route('status', { path: ':user/status/:id' })
    })
  }
  let router

  describe('events', () => {
    beforeEach(() => {
      router = new Router({ location: 'memory', routes })
      router.use(events)
      router.listen()
    })

    afterEach(() => {
      router.destroy()
    })

    describe('transition', () => {
      let transitionSpy

      beforeEach(() => {
        transitionSpy = spy()
        window.addEventListener('router-transition', transitionSpy)
      })

      afterEach(() => {
        window.removeEventListener('router-transition', transitionSpy)
      })

      it('should be fired on completed transition', async () => {
        await router.transitionTo('messages')
        expect(transitionSpy).to.be.calledOnce

        await router.transitionTo('notifications')
        expect(transitionSpy).to.be.calledTwice
      })

      it('should not be fired on cancelled transition', async () => {
        router.use(transition => transition.cancel())
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(transitionSpy).to.not.be.called
      })

      it('should not be fired on cancelled transition', async () => {
        router.use(() => { throw new Error('error') })
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(transitionSpy).to.not.be.called
      })
    })

    describe('abort', () => {
      let abortSpy

      beforeEach(() => {
        abortSpy = spy()
        window.addEventListener('router-abort', abortSpy)
      })

      afterEach(() => {
        window.removeEventListener('router-abort', abortSpy)
      })

      it('should not be fired on completed transition', async () => {
        await router.transitionTo('messages')
        expect(abortSpy).to.not.be.called

        await router.transitionTo('notifications')
        expect(abortSpy).to.not.be.called
      })

      it('should be fired on cancelled transition', async () => {
        router.use(transition => transition.cancel())
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(abortSpy).to.be.calledOnce
      })

      it('should be fired on cancelled transition', async () => {
        router.use(() => { throw new Error('error') })
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(abortSpy).to.be.calledOnce
      })
    })

    describe('error', () => {
      let errorSpy

      beforeEach(() => {
        errorSpy = spy()
        window.addEventListener('router-error', errorSpy)
      })

      afterEach(() => {
        window.removeEventListener('router-error', errorSpy)
      })

      it('should not be fired on completed transition', async () => {
        await router.transitionTo('messages')
        expect(errorSpy).to.not.be.called

        await router.transitionTo('notifications')
        expect(errorSpy).to.not.be.called
      })

      it('should not be fired on cancelled transition', async () => {
        router.use(transition => transition.cancel())
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(errorSpy).to.not.be.called
      })

      it('should be fired on cancelled transition', async () => {
        router.use(() => { throw new Error('error') })
        try {
          await router.transitionTo('messages')
        } catch (error) {
        }
        expect(errorSpy).to.be.calledOnce
      })
    })
  })

  describe('eventPrefix', () => {
    beforeEach(() => {
      router = new Router({ location: 'memory', routes, eventPrefix: 'my-router:' })
      router.use(events)
      router.listen()
    })

    afterEach(() => {
      router.destroy()
    })

    describe('customized', () => {
      let transitionSpy

      beforeEach(() => {
        transitionSpy = spy()
        window.addEventListener('my-router:transition', transitionSpy)
      })

      afterEach(() => {
        window.removeEventListener('my-router:transition', transitionSpy)
      })

      it('should be fired using eventPrefix option', async () => {
        await router.transitionTo('messages')
        expect(transitionSpy).to.be.calledOnce

        await router.transitionTo('notifications')
        expect(transitionSpy).to.be.calledTwice
      })
    })
  })
})
