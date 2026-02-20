// User-related helpers

function getUserById(id) {
  return APP.state.users.find(u => u.id === id);
}

function addUser(name, email, role) {
  const id = APP.state.nextId.users++;
  const u = { id, name, email, role, active: true };
  APP.state.users.push(u);
  APP.save();
  return u;
}

function updateUser(id, data) {
  const u = APP.state.users.find(x => x.id === id);
  if (!u) return null;
  Object.assign(u, data);
  APP.save();
  return u;
}

function removeUser(id) {
  APP.state.users = APP.state.users.filter(u => u.id !== id);
  APP.save();
}