import { Router } from 'slick-router'
import { routerLinks, bindRouterLinks } from 'slick-router/middlewares/router-links.js'

const router = new Router()
router.use(routerLinks)

bindRouterLinks()

router.listen()
