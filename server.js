
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.EBAY_CLIENT_ID;
const CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
let accessToken = null;

// Get eBay access token
async function getAccessToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
  });
  const data = await res.json();
  accessToken = data.access_token;
  return accessToken;
}

// Fetch eBay listings
app.get('/api/ebay-listings', async (req, res) => {
  const query = req.query.q || 'Charizard PSA 10';
  if (!accessToken) await getAccessToken();

  const result = await fetch(\`https://api.ebay.com/buy/browse/v1/item_summary/search?q=\${encodeURIComponent(query)}&limit=3\`, {
    headers: {
      Authorization: `Bearer \${accessToken}`
    }
  });

  const data = await result.json();
  res.json(data.itemSummaries || []);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:\${PORT}`));
