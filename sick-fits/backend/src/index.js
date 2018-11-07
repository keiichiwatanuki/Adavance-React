// let's go!
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mercadopago = require("mercadopago");
const myParser = require("body-parser");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

//TODO make a webhook to update MercadoPago payment status
mercadopago.configure({
  client_id: "8448432978772357",
  client_secret: process.env.MERCADOPAGO_SECRET
});

const server = createServer();

server.express.use(myParser.urlencoded({ extended: true }));
server.express.use(myParser.json());
//because the payment button doesnt return any id, i will have to look for the user
//of the notification
server.express.post("/mercadopago", async (req, res, next) => {
  const { type } = req.query;
  if (req.body.action === "payment.created" && type === "payment") {
    const {
      action,
      data: { id }
    } = req.body;
    console.log(action, id);
  } else {
  }
  //TODO fetch the payment info, and assign the id to the user that has the same email or dni
  next();
});

server.express.use(cookieParser());
//1.decode the current jwt so we can get the user id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    //put the userId onto the req for future request to access
    req.userId = userId;
  }
  next();
});
//2.Create a middleware that populates the user on each request
server.express.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    "{ id, permissions, email, name }"
  );
  req.user = user;
  next();
});
server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is running on port 
    http://localhost:${deets.port}`);
  }
);
