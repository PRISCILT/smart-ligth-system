// History-related helpers

function formatDate(ts) {
  return new Date(ts).toLocaleString('fr-FR');
}

function clearHistory() {
  APP.state.history = [];
  APP.save();
}