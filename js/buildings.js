// Building-related helpers

function getBuildingById(id) {
  return APP.state.buildings.find(b => b.id === id);
}

function getBuildingRoomCount(buildingId) {
  return APP.state.rooms.filter(r => r.buildingId === buildingId).length;
}

function addBuilding(name, address) {
  const id = APP.state.nextId.buildings++;
  const b = { id, name, address };
  APP.state.buildings.push(b);
  APP.save();
  return b;
}

function removeBuilding(id) {
  // Remove rooms and lights in the building
  const roomsToRemove = APP.state.rooms.filter(r => r.buildingId === id).map(r => r.id);
  APP.state.rooms = APP.state.rooms.filter(r => r.buildingId !== id);
  APP.state.lights = APP.state.lights.filter(l => !roomsToRemove.includes(l.roomId));
  APP.state.buildings = APP.state.buildings.filter(b => b.id !== id);
  APP.save();
}