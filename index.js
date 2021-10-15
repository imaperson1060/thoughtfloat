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


var typing = [];

io.on("connection", async (socket) => {
    socket.emit("thoughts", await query("SELECT * FROM `tf`"));

    socket.on("newThought", async (thought) => {
        await query("INSERT INTO `tf`(`thought`) VALUES (?)", [thought]);

        io.emit("thoughts", await query("SELECT * FROM `tf`"));
    });

    socket.on("typing", (sessionId) => {
        if (typing.find(x => x.id == sessionId)) return typing.find(x => x.id == sessionId).lastping = Math.round(Date.now() / 1000);
        typing.push({ id: sessionId, lastping: Math.round(Date.now() / 1000) });
        checkTyping(sessionId);
        io.emit("someoneTyping");
        console.log(typing)
    });

    socket.on("stoppedTyping", (sessionId) => {
        if (!typing.find(x => x.id == sessionId)) return;

        typing = typing.filter(x => x.id != sessionId);
        if (typing.length == 0) return io.emit("someoneStoppedTyping");
    });

    function checkTyping(sessionId) {
        if (typing.length == 0) return;

        if (typing.find(x => x.id == sessionId).lastping < Math.round(Date.now() / 1000) - 10) {
            typing = typing.filter(x => x.id != sessionId);
            if (typing.length == 0) return io.emit("someoneStoppedTyping");
        }
        else {
            setTimeout(() => { checkTyping(sessionId) }, 1000);
        }
    }
});


app.get("/up/", (req, res) => {
    res.json({ "success": true });
});

app.post("/restart/", (req, res) => {
    const expectedSignature = "sha1=" +
        require("crypto").createHmac("sha1", process.env.PASSWORD)
            .update(JSON.stringify(req.body))
            .digest("hex");

    const signature = req.headers["x-hub-signature"];
    if (signature == expectedSignature) {
        res.sendStatus(200);
        process.exit();
    }
});


server.listen(process.env.PORT, () => {
    console.log(`Thoughtfloat Ready! (${process.env.PORT})`);
});