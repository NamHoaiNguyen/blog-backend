function createHttpRequest(req_body, api_endpoint, http_method) {
  const http_request = new Request(api_endpoint, {
    method: http_method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: (http_method === 'POST') ? req_body : null
  })
    
  return http_request
}

async function getHttpResponse(req_body, api_endpoint, http_method) {
  const http_request = createHttpRequest(req_body, api_endpoint, http_method)

  const http_response = await fetch(http_request)

  return http_response
}

export { getHttpResponse }