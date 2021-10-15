module.exports = (database, io) => {
    io.on("connection", (socket) => {
        socket.on("start", () => {
            console.log("A");
        });
    });
}