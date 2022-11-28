const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

//mongodbapi
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rfyyfuu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// JWT
// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWTOKEN, function (err, decoded) {
//     if (err) {
//       return res.status(401).send({ message: "unauthorized access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

//mongodb try function start---
async function run() {
  try {
    const productCollection = client.db("MotoHub").collection("products");
    const usersCollection = client.db("MotoHub").collection("users");

    app.post("/add-product", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.JWTOKEN, {
          expiresIn: "1h",
        });
        res.send({ accessToken: token });
      } else {
        res.send({ accessToken: "" });
      }
      // res.status(403).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const isUserAvailable = await usersCollection.findOne(query);
      if (!isUserAvailable) {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      }
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

// Express
app.listen(port, () => {
  console.log("Server running on port", port);
});

app.get("/", (req, res) => {
  res.send("Server Running");
});
