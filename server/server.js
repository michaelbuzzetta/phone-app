const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.send('Push server is live!'));

app.post('/send', async (req, res) => {
  const { to, title, body } = req.body;

  const message = {
    to,
    sound: 'default',
    title,
    body
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Error sending push:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
