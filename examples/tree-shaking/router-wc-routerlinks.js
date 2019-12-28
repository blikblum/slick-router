import { Router } from 'slick-router'
import { wc, queryValue, paramValue } from 'slick-router/middlewares/wc'
import { routerLinks, withRouterLinks } from 'slick-router/middlewares/router-links'

const router = new Router()
router.use(wc)
router.use(routerLinks)

queryValue()
paramValue()

withRouterLinks()
