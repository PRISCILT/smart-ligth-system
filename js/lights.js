// Light-related helpers

function toggleLight(id) {
  const light = APP.state.lights.find(l => l.id === id);
  if (!light) return;
  light.on = !light.on;
  if (light.on) {
    light.onSince = Date.now();
    light.intensity = light.intensity || 80;
  } else {
    light.onSince = null;
    light.intensity = 0;
  }
  addHistory(id, light.name, light.on ? 'ON' : 'OFF');
  APP.save();
  return light;
}

function getAlerts() {
  const alerts = [];
  const threshold = 4 * 3600000; // 4 heures
  APP.state.lights.forEach(l => {
    if (l.on && l.onSince && (Date.now() - l.onSince) > threshold) {
      const hours = Math.floor((Date.now() - l.onSince) / 3600000);
      alerts.push({ lightId: l.id, lightName: l.name, hours });
    }
  });
  return alerts;
}

function addHistory(lightId, lightName, action) {
  const entry = {
    id: APP.state.nextId.history++,
    lightId, lightName, action,
    user: APP.currentUser ? APP.currentUser.name : 'Admin',
    timestamp: Date.now()
  };
  APP.state.history.unshift(entry);
  APP.save();
  return entry;
}