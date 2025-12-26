import { Router, interceptLinks } from 'slick-router'

const router = new Router()
interceptLinks(router)

router.listen()
