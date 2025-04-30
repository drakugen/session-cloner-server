const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const store = {}; // { deviceId: { url: [ {cookies, sessionName, timestamp} ] } }

app.post("/cookies", (req, res) => {
  const { deviceId, url, cookies, sessionName } = req.body;

  console.log("🔐 Sessão recebida:");
  console.log("- URL:", url);
  console.log("- Sessão:", sessionName);
  console.log("- Device ID:", deviceId);
  console.log("- Cookies recebidos:", cookies?.length);

  if (!deviceId || !url || !Array.isArray(cookies)) {
    console.log("❌ Dados inválidos");
    return res.status(400).send("Dados inválidos");
  }

  if (!store[deviceId]) store[deviceId] = {};
  if (!store[deviceId][url]) store[deviceId][url] = [];

  store[deviceId][url].unshift({ cookies, sessionName, timestamp: Date.now() });

  res.sendStatus(200);
});

app.get("/cookies", (req, res) => {
  const { url, deviceId } = req.query;
  const sessions = store[deviceId]?.[url] || [];
  const latest = sessions[0];
  res.json(latest || {});
});

app.get("/cookies/all", (req, res) => {
  const { url, deviceId } = req.query;
  const sessions = store[deviceId]?.[url] || [];
  console.log(`📥 Buscando sessões para ${url} (deviceId: ${deviceId}) — ${sessions.length} encontrada(s)`);
  res.json(sessions);
});

app.post("/cookies/delete", (req, res) => {
  const { url, sessionName } = req.body;

  for (const device in store) {
    if (store[device][url]) {
      store[device][url] = store[device][url].filter(sess => sess.sessionName !== sessionName);
    }
  }

  res.sendStatus(200);
});
app.listen(PORT, () => {
  console.log(`✅ Session Sync Server running on port ${PORT}`);
});