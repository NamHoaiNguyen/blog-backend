import { getHttpResponse } from "./http.js"
import { 
  kong_authorize_endpoint_suffix, 
  kong_token_endpoint_suffix,
  kong_route_login_path } 
  from "./constants.js"

// Retrieves the OAuth 2.0 client application name from
//  a given client_id - used for a nicer fronted experience
async function getApplicationName(client_id, callback) {
  const application_name_endpoint = process.env.KONG_ADMIN + "/oauth2/" + client_id

  return getHttpResponse(null, application_name_endpoint, "GET").then((response) => {
    return response.json()
  }).then((response) => {
    callback(response.name)
  })
}

// Retrieves auth code in authorization code flow.
async function getAuthorizationCode(client_id, response_type, scope) {
  console.log("namnh2 check getAuthorizationCode: ", client_id, response_type, scope)
  
  const authorizaion_endpoint = process.env.KONG_API + kong_route_login_path + kong_authorize_endpoint_suffix;
  const request_body = JSON.stringify({
    client_id: process.env.CLIENT_ID,
    response_type: response_type,
    scope: scope,
    provision_key: process.env.PROVISION_KEY_LOGIN_PATH,
    authenticated_userid: "authenticated_tester", // Hard-coding this value (it should be the logged-in user ID)
    redirect_url: "https://127.0.0.1:3301/callbacks"
  })

  return getHttpResponse(request_body, authorizaion_endpoint, "POST").then((response) => {
    return response
  })
}

async function getAccessTokenAndRefreshToken(authorization_code) {
  const token_endpoint = process.env.KONG_API + kong_route_login_path + kong_token_endpoint_suffix
  const request_body = JSON.stringify({
    grant_type: "authorization_code",
    code: authorization_code,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    // redirect_url: "https://127.0.0.1:3301/callbacks" // Hard-coding this value (it should be the logged-in user ID)
  })

  return getHttpResponse(request_body, token_endpoint, "POST")
}

export { getApplicationName, getAuthorizationCode, getAccessTokenAndRefreshToken }