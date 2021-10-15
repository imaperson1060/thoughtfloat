module.exports = (database, io) => {
    io.on("connection", (socket) => {
        socket.on("start", async () => {
            socket.emit("messages", await database.query("SELECT * FROM `tf`"));
        });
    });
}