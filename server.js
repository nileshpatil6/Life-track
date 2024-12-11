const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client with your URL and anon key
const supabase = createClient('https://zahrwpisuxdguboorgtp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaHJ3cGlzdXhkZ3Vib29yZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDY2MjcsImV4cCI6MjA0OTQ4MjYyN30.T3gsO7oF-5-AWO9F3yrgDFup9-ygwJPr3X6WB6xNibw');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to receive and store messages
app.post('/send', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send({ error: 'Message is required' });
  }

  // Insert message into Supabase
  const { data, error } = await supabase
    .from('messages')
    .insert([{ message }]);

  if (error) {
    console.error('Error inserting message:', error);
    return res.status(500).send({ error: 'Error saving message' });
  }

  console.log('Message received:', message);
  res.status(200).send({ status: 'Message received successfully' });
});

// Endpoint to get all stored messages
app.get('/receive', async (req, res) => {
  // Fetch all messages from Supabase
  const { data, error } = await supabase
    .from('messages')
    .select('message, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).send({ error: 'Error fetching messages' });
  }

  res.status(200).send({ messages: data });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
