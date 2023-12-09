import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import dotenv from 'dotenv'
import url from 'node:url'

import {
  getAccessTokenAndRefreshToken, 
  getApplicationName, 
  getAuthorizationCode } from '../utils/oauth2_utils.js'
import { getHttpResponse } from '../utils/http.js'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __viewpath = path.basename(path.dirname(__dirname))
const __absolutepath = path.resolve(__viewpath)

// dotenv.config({ path: "../../.env"});

const scope_object = '{"email":"Grant permissions to read your email address", \"address": "Grant permissions to read your address information", "phone": "Grant permissions to read your mobile phone number"}';
var SCOPE_DESCRIPTIONS = JSON.parse(scope_object)

async function loginGetAPI(req, res) {
  try {
    return res.sendFile(__absolutepath + '/views/login.html')
  } catch(error) {
    return res.status(404).json({message : "Page not found!"})
  }
}

async function loginPostAPI(req, res) {
  try {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

    // TODO(namnh): This url is used to test.
    // In reality, it should be API of account service
    // to verify account. 
    // http://host.docker.internal
    const redirect_url = "https://127.0.0.1:3301/testlogin"

    const request_body = JSON.stringify({
      email: email,
      password: password,
    })

    return getHttpResponse(request_body, redirect_url, "POST")
      .then((http_response) => {
        loginPostCallback(http_response, res)
      })

  } catch (error) {
    return res.status(401).json({message: "Invalid authorization!!!"})
  }
}

function loginPostCallback(http_response, res) {
  if (http_response.ok) {
    const urlSearchParams = new URLSearchParams(({
      response_type: "code",
      // TODO(namnh) : should we hard fix code like that?
      scope: "address",
      client_id: process.env.CLIENT_ID
    }));
    return res.redirect('/account/authorization?' + urlSearchParams.toString())
  } else {
    return res.status(401).json({ message: "Invalid email or password POST login api!!!" })
  }
}

async function authorizeGetAPI(req, res) {
  var querystring = url.parse(req.url, true)

  getApplicationName(querystring.query.client_id, function (application_name) {
    if (application_name) {
      res.render('authorization', {
        client_id: querystring.query.client_id,
        response_type: querystring.query.response_type,
        scope: querystring.query.scope,
        application_name: application_name,
        SCOPE_DESCRIPTIONS: SCOPE_DESCRIPTIONS
      });
    } else {
      res.status(403).send("Invalid client_id");
    }
  });
}

async function authorizePostAPI(req, res) {
  return getAuthorizationCode(req.body.client_id, req.body.response_type, req.body.scope)
    .then((response) => {
      if (!response.ok) {
        return res.status(400).json({message : "Error when getting auth code"})
      }

      return response.json().then((response) => {
        const url = new URL(response.redirect_uri)
        const urlParams = new URLSearchParams(url.search);
        const code = urlParams.get("code");

        res.redirect('/oauth2/tokens/?code=' + code)
      })
    })
}

async function oauth2GetTokens(req, res) {
  const authorization_code = req.query.code

  return getAccessTokenAndRefreshToken(authorization_code)
    .then((response) => {
      oauth2GetTokensCallback(response, res)
    })
}

function oauth2GetTokensCallback(http_response, res) {
  console.log("value of response get token: ", http_response.status)

  if (http_response.ok) {
    http_response.json().then((http_response) => {
      console.log("value of accesstoken and refereshtoken: ", http_response)
      res.cookie("access_token", http_response.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })

      res.cookie("refresh_token", http_response.refresh_token, {
        path: "/refresh",
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      })
      return res.status(200).json({ message: "Sent token successfully!!!", tokens: http_response })
    })
  } else {
    return res.status(401).json({ message: "Invalid authorization!!!" })
  }
}

export { 
  loginGetAPI, 
  loginPostAPI, 
  authorizeGetAPI, 
  authorizePostAPI,
  oauth2GetTokens }