module.exports = (query, io) => {
    io.on("connection", (socket) => {
        socket.on("start", async () => {
            socket.emit("messages", await query("SELECT * FROM `tf`"));
        });
    });
}