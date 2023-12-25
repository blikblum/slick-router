import { Router } from 'slick-router'
import { routerLinks, bindRouterLinks } from 'slick-router/middlewares/router-links'

const router = new Router()
router.use(routerLinks)

bindRouterLinks()
