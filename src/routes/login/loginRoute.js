import express from "express"

import { 
  showAuthorizePage,
  authorizePostAPI, 
  showLoginPage, 
  loginByNativeAccount} 
  from "../../app/login/native-account/api/loginController.js"

export const loginRouter = express.Router()

// APIs for authorization flow
loginRouter.get('/account/authorization', showAuthorizePage)

loginRouter.post('/account/authorization', authorizePostAPI)

// (end) APIs for authorization flow.

loginRouter.get('/account/login', showLoginPage)

loginRouter.post('/account/login', loginByNativeAccount)