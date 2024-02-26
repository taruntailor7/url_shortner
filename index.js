const express = require("express");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const { connectToMongoDB } = require("./connect");

const app = express();
const PORT = 8000;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Connected to Mongo DB!")
)

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
            timestamp: Date.now()
        },
      },
    }
    );
    res.redirect(entry.redirectUrl);
})

app

app.listen(PORT, () => console.log("Server listening on PORT:", PORT));
