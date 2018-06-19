const express = require("express");
const app = express();

app.use(express.static("static"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
