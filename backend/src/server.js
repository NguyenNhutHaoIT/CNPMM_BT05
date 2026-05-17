require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connection = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1/api', apiRoutes);

const port = process.env.PORT || 8080;
(async () => {
  try {
    await connection();
    app.listen(port, () => console.log(`Backend listening ${port}`));
  } catch (err) {
    console.error(err);
  }
})();
