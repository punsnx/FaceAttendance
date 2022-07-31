const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class MongoDB {
  async connection(connection, options = {}) {
    try {
      const client = await MongoClient.connect(connection.URI, options);
      const db = await client.db(connection.DB);
      MongoDB.db = db;
      MongoDB.client = client;
    } catch (ex) {
      console.log(ex.message);
    }
  }
}

MongoDB.db = {};
MongoDB.client = {};

class MongoModel extends MongoDB {
  constructor(collectionName) {
    super();
    this.collectionName = collectionName;
  }

  get collection() {
    return MongoModel.db.collection(this.collectionName);
  }
}

// get mongodb, for an example: import from another file
const mongodb = new MongoDB();
// connect to mongodb from 'server.js' or 'app.js'
mongodb.connection(
  { URI: "mongodb://localhost:27017", DB: "blog_dev" },
  { useUnifiedTopology: true }
);

const somethingModel = new MongoModel("something");
// an example another collection
const anotherModel = new MongoModel("anotherCollection");

// model find
async function findSomething() {
  try {
    const result = await somethingModel.collection.find({}).toArray();

    return result;
  } catch (ex) {
    console.log(ex.message);
  }
}

// model create
async function createSomething(payload) {
  try {
    const result = await somethingModel.collection.insert(payload);
    return result.ops[0];
  } catch (ex) {
    console.log(ex.message);
  }
}

// get controller
app.get("/", async (req, res) => {
  try {
    const result = await findSomething();
    console.log(result);
    res.status(200).send(result);
  } catch (ex) {
    console.log(ex.message);
  }
});

// create controller
app.post("/", async (req, res) => {
  try {
    const result = await createSomething(req.body);
    res.status(200).send(result);
  } catch (ex) {
    console.log(ex.message);
  }
});

app.listen(3000, () => console.log("Server is up on port 3000"));
