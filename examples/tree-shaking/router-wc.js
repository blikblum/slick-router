import { Router } from 'slick-router'
import { fromQuery, fromParam } from 'slick-router/middlewares/wc.js'

const router = new Router()

fromQuery()
fromParam()

router.listen()
