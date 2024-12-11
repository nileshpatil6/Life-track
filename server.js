const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const messagesFile = 'messages.json';

// Initialize the messages file if it doesn't exist
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([]));
}

// Endpoint to receive and store messages
app.post('/send', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).send({ error: 'Message is required' });
  }

  // Read the current messages from the file
  const messages = JSON.parse(fs.readFileSync(messagesFile));

  // Add the new message to the list
  messages.push({ message, timestamp: new Date() });

  // Write the updated list back to the file
  fs.writeFileSync(messagesFile, JSON.stringify(messages));

  console.log('Message received:', message);
  res.status(200).send({ status: 'Message received successfully' });
});

// Endpoint to get all stored messages
app.get('/receive', (req, res) => {
  // Read and return all messages from the file
  const messages = JSON.parse(fs.readFileSync(messagesFile));
  res.status(200).send({ messages });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
