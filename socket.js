module.exports = (database, io) => {
    io.on("connection", (socket) => {
        socket.on("start", () => {
            socket.emit("messages", [ "a", "b" ]);
        });
    });
}