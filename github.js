module.exports = (app, crypto) => {
    app.post("/restart/", (req, res) => {
        const expectedSignature = "sha1=" +
            crypto.createHmac("sha1", process.env.PASSWORD)
                .update(JSON.stringify(req.body))
                .digest("hex");

        const signature = req.headers["x-hub-signature"];
        if (signature == expectedSignature) {
            res.sendStatus(200);
            process.exit();
        }
    });
}