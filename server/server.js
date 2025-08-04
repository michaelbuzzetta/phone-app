const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const userTokens = {};

app.post('/register', (req, res) => {
  const { name, token } = req.body;

  if (!name || !token) {
    return res.status(400).json({ error: 'Missing name or token' });
  }

  userTokens[name] = token;
  console.log(`✅ Registered ${name}: ${token}`);
  res.json({ success: true });
});

app.post('/send', async (req, res) => {
  const { to, title, body } = req.body;

  const message = {
    to,
    sound: 'default',
    title,
    body,
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('❌ Error sending push:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/send-to-name', async (req, res) => {
  const { toName, title, body } = req.body;

  const token = userTokens[toName];
  if (!token) {
    return res.status(404).json({ error: `No token found for user "${toName}"` });
  }

  const message = {
    to: token,
    sound: 'default',
    title,
    body,
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    console.log(`📨 Sent notification to ${toName}`);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(`❌ Error sending push to ${toName}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log('🚀 Push server running on http://localhost:4000');
});
