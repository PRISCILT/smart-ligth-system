// Room-related helpers

function getRoomById(id) {
  return APP.state.rooms.find(r => r.id === id);
}

function getRoomLightCount(roomId) {
  return APP.state.lights.filter(l => l.roomId === roomId).length;
}

function addRoom(name, buildingId) {
  const id = APP.state.nextId.rooms++;
  const r = { id, name, buildingId };
  APP.state.rooms.push(r);
  APP.save();
  return r;
}

function removeRoom(id) {
  APP.state.lights = APP.state.lights.filter(l => l.roomId !== id);
  APP.state.rooms = APP.state.rooms.filter(r => r.id !== id);
  APP.save();
}