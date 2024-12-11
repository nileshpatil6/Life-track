const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable PORT or default to 3000

app.use(bodyParser.json());
app.use(cors());

let message = ''; // Store the message

app.post('/send', (req, res) => {
  message = req.body.message;
  console.log('Message received:', message);
  res.status(200).send({ status: 'Message received successfully' });
});

app.get('/receive', (req, res) => {
  res.status(200).send({ message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
