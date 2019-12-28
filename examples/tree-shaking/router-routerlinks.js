import { Router } from 'slick-router'
import { routerLinks, withRouterLinks } from 'slick-router/middlewares/router-links'

const router = new Router()
router.use(routerLinks)

withRouterLinks()
