import { Router } from 'slick-router'
import { wc, fromQuery, fromParam } from 'slick-router/middlewares/wc.js'
import { routerLinks, bindRouterLinks } from 'slick-router/middlewares/router-links.js'

const router = new Router()
router.use(wc)
router.use(routerLinks)

fromQuery()
fromParam()

bindRouterLinks()
router.listen()
