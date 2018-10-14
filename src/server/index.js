const process = require("process");
const express = require("express");
const os = require("os");
const app = express();
app.use(express.static("dist"));
app.get("/api/getUsername", (req, res) =>
    res.send({ username: os.userInfo().username })
);

const port = process.env.PORT || (process.env.NODE_ENV == 'production' ? 3000 : 3001);
app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}!`));
