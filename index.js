const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.set("json spaces", 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

require("dotenv").config();

const mysqlLogin = JSON.parse(process.env.MYSQL);
var database = require("mysql").createPool(mysqlLogin);
var query = require("util").promisify(database.query).bind(database);


require("./socket.js")(database, io);


app.get("/up/", (req, res) => {
    res.json({ "success": true });
});

app.post("/restart/", (req, res) => {
    const expectedSignature = "sha256=" +
        require("crypto").createHmac("sha256", process.env.PASSWORD)
            .update(JSON.stringify(req.body))
            .digest("hex");

    const signature = req.headers["x-hub-signature-256"];
    console.log(signature);
    console.log(expectedSignature);
    if (signature == expectedSignature) {
        res.sendStatus(200);
        process.exit();
    }
});


server.listen(process.env.PORT, () => {
    console.log(`Thoughtfloat Ready! (${process.env.PORT})`);
});