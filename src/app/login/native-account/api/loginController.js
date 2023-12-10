import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import dotenv from "dotenv";
import url from "node:url";

import {
  execAuthFlow,
  execClientCredentialFlow,
  getAccessTokenAndRefreshToken,
  getApplicationName,
  getAuthorizationCode,
} from "#utils/kong/kong_utils.js";
import { getHttpResponse } from "#utils/net/http.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __viewpath = path.basename(path.dirname(__dirname));
const __absolutepath = path.resolve(__viewpath);

const scope_object =
  '{"email":"Grant permissions to read your email address", "address": "Grant permissions to read your address information", "phone": "Grant permissions to read your mobile phone number"}';
var SCOPE_DESCRIPTIONS = JSON.parse(scope_object);

function showLoginPage(req, res) {
  try {
    return res.sendFile("/home/node/src/views/login.html");
  } catch (error) {
    return res.status(404).json({ message: "Page not found!" });
  }
}

function loginByNativeAccount(req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // TODO(namnh): This url is used to test.
    // In reality, it should be API of account service
    // to verify account.
    // http://host.docker.internal
    const redirect_url = "https://127.0.0.1:3301/testlogin";

    const request_body = JSON.stringify({
      email: email,
      password: password,
    });

    return getHttpResponse(request_body, redirect_url, "POST").then(
      (http_response) => {
        loginCallback(http_response, res);
      }
    );
  } catch (error) {
    return res.status(401).json({ message: "Invalid authorization!!!" });
  }
}

function loginCallback(http_response, res) {
  // Client credential flow.
  if (http_response.ok) {
    return execClientCredentialFlow("address")
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        console.log("Access token value in Client credential flow: ", response);
        res
          .status(200)
          .json({ message: "Sent token successfully!!!", tokens: response });
      });

    // Test Auth Flow.
    // const urlSearchParams = new URLSearchParams(({
    //   response_type: "code",
    //   // TODO(namnh) : should we hard fix code like that?
    //   scope: "address",
    //   client_id: process.env.CLIENT_ID
    // }));
    // return res.redirect('/account/authorization?' + urlSearchParams.toString())
  } else {
    return res
      .status(401)
      .json({ message: "Invalid email or password POST login api!!!" });
  }
}

// Functions to execute auth flow (starting).
function showAuthorizePage(req, res) {
  var querystring = url.parse(req.url, true);

  getApplicationName(querystring.query.client_id, function (application_name) {
    if (application_name) {
      res.render("authorization", {
        client_id: querystring.query.client_id,
        response_type: querystring.query.response_type,
        scope: querystring.query.scope,
        application_name: application_name,
        SCOPE_DESCRIPTIONS: SCOPE_DESCRIPTIONS,
      });
    } else {
      res.status(403).send("Invalid client_id");
    }
  });
}

async function authorizePostAPI(req, res) {
  return execAuthFlow(req.body.response_type, req.body.scope).then((response) => {
    if (response === undefined) {
      return res.status(401).json({ message: "Invalid authorization!!!" });
    } 
      
    console.log("Value of accesstoken and refreshtoken: ", response);
    res.cookie("access_token", response.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    res.cookie("refresh_token", response.refresh_token, {
      path: "/refresh",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return res
      .status(200)
      .json({ message: "Sent token successfully!!!", tokens: response });
  })
}
// Functions to execute auth flow (ending).

export {
  showLoginPage,
  loginByNativeAccount,
  showAuthorizePage,
  authorizePostAPI,
};
