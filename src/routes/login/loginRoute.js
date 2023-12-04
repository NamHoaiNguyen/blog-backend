import express from "express"

import { 
  authorizeGetAPI,
  authorizePostAPI, 
  loginGetAPI, 
  loginPostAPI,
  oauth2GetTokens } from "../../controller/loginController.js"

export const loginRouter = express.Router()

loginRouter.get('/account/authorization', authorizeGetAPI)

loginRouter.post('/account/authorization', authorizePostAPI)

loginRouter.get('/account/login', loginGetAPI)

loginRouter.post('/account/login', loginPostAPI)

// TODO(namnh): This api should be POST method.
// Temporarily set it to GET to debug.
loginRouter.get('/oauth2/tokens', oauth2GetTokens)