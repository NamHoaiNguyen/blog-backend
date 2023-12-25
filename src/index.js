
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import fs from 'fs'
import https from 'https'
import swaggerUI from 'swagger-ui-express'
import yaml from 'yaml'

import { route } from './routes/routes.js'

const app = express()

const SSL_KEY = fs.readFileSync('./certificate/key.pem')
const SSL_CERT = fs.readFileSync('./certificate/cert.pem')

const swagger_config_file = fs.readFileSync('/home/node/config/swagger/swagger.yaml', 'utf8')
const swaggerDocument = yaml.parse(swagger_config_file)

app.set('view engine', 'jade');
// app.set("view engine", "ejs"); 
app.use(bodyParser());
app.use(cookieParser())

// Accept every SSL certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const LISTEN_PORT = 3301

app.use('/api/documentations', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// TODO(namnh2): fake api of account service to verify account is created or not.
app.post('/testlogin', (req, res) => {
  const email = req.body.email
  const password = req.body.password 

  console.log("email and password: ", email, password)

  if (email == 'namnh2@gmail.com' && password == 'namnh2') {
    return res.status(200).json({message: "Login successfully!!!"})
  }

  return res.status(401).json({message: "Authorization failed. Relogin!!!"})
})


// TODO(namnh2): fake an api need authorization to test
app.get('/testaccservice', (req, res) => {
  console.log("DLOG check http header", req.headers);
  res.status(200).json({message: "Account service Access successed!!!"})
})

// TODO(namnh2): fake an api need authorization to test
app.get('/testpostservice', (req, res) => {
  console.log("DLOG check http header", req.headers);
  res.status(200).json({message: "Post service Access successed!!!"})
})

// Index page
app.get("/", function(req, res) {
  res.render('index');
});

// Route to pages.
app.use('/', route)

const server = https.createServer({ key: SSL_KEY, cert: SSL_CERT }, app)
server.listen(LISTEN_PORT, () => {
  console.log("Server is listening on https://konghq.com:${port}")
})

console.log("Running at Port " + LISTEN_PORT);