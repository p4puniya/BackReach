require('dotenv').config();
const express = require('express');

const voiceRouter = require('./routes/voice');
const step1Router = require('./routes/step1');
const nameRouter = require('./routes/name');
const timeRouter = require('./routes/time');
const missedCallRouter = require('./routes/missedCall');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/voice', voiceRouter);
app.use('/step1', step1Router);
app.use('/name', nameRouter);
app.use('/time', timeRouter);
app.use('/', missedCallRouter);

app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: 'internal_error' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});
