import { Router } from 'slick-router'
import { wc, queryValue, paramValue } from 'slick-router/middlewares/wc'

const router = new Router()
router.use(wc)

queryValue()
paramValue()
