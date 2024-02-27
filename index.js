const express = require("express");
const cookieParser = require("cookie-parser");
const URL = require("./models/url");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const path = require("path");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8000;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Connected to Mongo DB!")
)

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// app.get("/test", async(req, res) => {
//   const allUrls = await URL.find({});
//   return res.render('home', {
//     urls : allUrls
//   });
// })

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
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

    if (!entry || !entry.redirectUrl) {
      return res.status(404).send("URL not found");
    }
    
    return res.redirect(entry.redirectUrl);
})

app.listen(PORT, () => console.log("Server listening on PORT:", PORT));
