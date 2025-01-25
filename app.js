import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

// mongoose
//   .connect(
//     "mongodb+srv://dhartidhkis:Dharti@123@cluster0tes.qtsgj.mongodb.net/Items?retryWrites=true&w=majority"
//   )
//   .then(() => console.log("Mongodb connected!"))
//   .catch((err) => console.log(err));

const uri = "mongodb://localhost:27017/test";

mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Failed to connect", err));
//Schema defination

const Itemschema = new mongoose.Schema({
  name: String,
  description: String,
});

const Item = mongoose.model("Item", Itemschema);

// CRUD routes
// Create
app.post("/items", async (req, res) => {
  const { name, description } = req.body;
  const newItem = new Item({ name, description });

  try {
    await newItem.save();
    res.status(201).send(newItem);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read (Get all items)
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Read (Get single item)
app.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).send("Item not found");
    res.status(200).send(item);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update
app.put("/items/:id", async (req, res) => {
  const { name, description } = req.body;
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!updatedItem) return res.status(404).send("Item not found");
    res.status(200).send(updatedItem);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete
app.delete("/items/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).send("Item not found");
    res.status(200).send(deletedItem);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(7000, () => {
  console.log("port listen on 7000");
});
