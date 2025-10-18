require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();


app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting 
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // default 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10), // default 60 requests per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);


const PORT = 3000;
const EMAIL = 'hamidadeshina1@gmail.com';
const NAME = 'Balogun Hamid Adeshina';
const STACK = 'Node.js/Express';
const CATFACT_URL = 'https://catfact.ninja/fact';
const CATFACT_TIMEOUT_MS = parseInt(process.env.CATFACT_TIMEOUT_MS || '3000', 10);


async function fetchCatFact() {
  try {
    const res = await axios.get(CATFACT_URL, { timeout: CATFACT_TIMEOUT_MS });
    if (res?.data && typeof res.data.fact === 'string') {
      return { fact: res.data.fact, source: 'catfact.ninja' };
    } else {
      return { fact: 'No cat fact returned by upstream service.', source: 'fallback' };
    }
  } catch (err) {
    console.error('Error fetching cat fact:', err.message || err);
    return { fact: 'Could not fetch cat fact at the moment. Try again later.', source: 'fallback' };
  }
}


app.get('/me', async (req, res) => {
  const catRes = await fetchCatFact();

  const payload = {
    status: 'success',
    user: {
      email: EMAIL,
      name: NAME,
      stack: STACK
    },
    timestamp: new Date().toISOString(), // UTC ISO 8601
    fact: catRes.fact
  };

  // Ensure JSON content-type
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(payload);
});



// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} — GET /me`);
});
