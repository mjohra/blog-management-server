const express = require('express');
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const fileUpload = require("express-fileupload");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//
//Database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vamyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("connected to database");
    const database = client.db("blog");

    const blogCollection = database.collection("blog");
    //add blog
    app.post("/blog", async (req, res) => {
      console.log(req.body);
      const name = req.body.name;
      const email = req.body.email;
      const category = req.body.category;
      const title = req.body.title;
      const description = req.body.description;
      const date=req.body.date;
      const time=req.body.time;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic=picData.toString('base64');
      const imageBuffer=Buffer.from(encodedPic,'base64');
      
      const post = {
        name,
        email,
        category,
        title,
        description,
        date,
        time,
        image: imageBuffer
      };
      const result = await blogCollection.insertOne(post);
      res.json(result);
    });

    //get blog
    app.get("/blog", async (req, res) => {
      const cursor = blogCollection.find({});
      console.log('hit api');
      const order = await cursor.toArray();
      res.send(order);
    });
//delete 
    app.delete("/blog/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await blogCollection.deleteOne(query);
        res.json(result);
      });
    
  } finally {
    //await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running Blog server");
});

app.listen(port, () => {
  console.log("running blog server on port", port);
});
