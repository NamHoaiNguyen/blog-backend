import express, { Router } from 'express'

import { loginRouter } from './login/loginRoute.js'

export const route = express.Router()

route.use('/', loginRouter)