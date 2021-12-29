const express = require("express");
const cors = require('cors');
const server = express();
const port = process.env.port || 3001;
const trade = require('./controller/trade-controller')



server.use(express.json());
server.use(cors({ origin: 'http://localhost:3000' }));

server.use('/trade', trade)



server.listen(port, () =>
    console.log(`Listening on http://localhost:${port}`)
);