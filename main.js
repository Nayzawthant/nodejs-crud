require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors");
const session = require("express-session");

const port = process.env.PORT || 5000;

// middlewares

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect(process.env.DB_URI).then(()=>{
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.log(error.message)
})

app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));

// set template engine
app.set('view engine', 'ejs');

// route prefix
app.use("", require("./routes/routes"));

// API Creation


app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}`)
})