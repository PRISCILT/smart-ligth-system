// ============================================================
// SMART LIGHT SYSTEM — État Global Centralisé
// ============================================================

const APP = {
  currentUser: null,

  state: {
    buildings: [
      { id: 1, name: 'Bâtiment A', address: 'Campus Principal' },
      { id: 2, name: 'Bâtiment B', address: 'Annexe Nord' },
      { id: 3, name: 'Bâtiment C', address: 'Laboratoires' },
    ],
    rooms: [
      { id: 1, name: 'Amphi A', buildingId: 1 },
      { id: 2, name: 'Salle 101', buildingId: 1 },
      { id: 3, name: 'Salle 102', buildingId: 1 },
      { id: 4, name: 'Amphi B', buildingId: 2 },
      { id: 5, name: 'Labo Info', buildingId: 3 },
      { id: 6, name: 'Salle de réunion', buildingId: 2 },
    ],
    lights: [
      { id: 1, name: 'L1', roomId: 1, on: true, intensity: 80, onSince: Date.now() - 7 * 3600000 },
      { id: 2, name: 'L2', roomId: 1, on: true, intensity: 60, onSince: Date.now() - 2 * 3600000 },
      { id: 3, name: 'L3', roomId: 2, on: false, intensity: 0, onSince: null },
      { id: 4, name: 'L4', roomId: 2, on: true, intensity: 100, onSince: Date.now() - 1 * 3600000 },
      { id: 5, name: 'L5', roomId: 3, on: false, intensity: 0, onSince: null },
      { id: 6, name: 'L6', roomId: 4, on: true, intensity: 50, onSince: Date.now() - 5 * 3600000 },
      { id: 7, name: 'L7', roomId: 5, on: false, intensity: 0, onSince: null },
      { id: 8, name: 'L8', roomId: 6, on: true, intensity: 90, onSince: Date.now() - 3 * 3600000 },
      { id: 9, name: 'L9', roomId: 1, on: false, intensity: 0, onSince: null },
      { id: 10, name: 'L10', roomId: 3, on: true, intensity: 70, onSince: Date.now() - 6 * 3600000 },
    ],
    history: [
      { id: 1, lightId: 1, lightName: 'L1', action: 'ON', user: 'Admin', timestamp: Date.now() - 7 * 3600000 },
      { id: 2, lightId: 6, lightName: 'L6', action: 'ON', user: 'Admin', timestamp: Date.now() - 5 * 3600000 },
      { id: 3, lightId: 10, lightName: 'L10', action: 'ON', user: 'Technicien', timestamp: Date.now() - 6 * 3600000 },
    ],
    planning: [
      { id: 1, lightId: 1, lightName: 'L1', heureOn: '18:00', heureOff: '06:00', repeat: 'Quotidien' },
      { id: 2, lightId: 2, lightName: 'L2', heureOn: '07:00', heureOff: '22:00', repeat: 'Lun-Ven' },
    ],
    users: [
      { id: 1, name: 'Admin', email: 'admin@smart.com', role: 'Admin', active: true },
      { id: 2, name: 'Technicien Jean', email: 'jean@smart.com', role: 'Technicien', active: true },
      { id: 3, name: 'Viewer Marie', email: 'marie@smart.com', role: 'Viewer', active: false },
    ],
    nextId: { buildings: 4, rooms: 7, lights: 11, history: 4, planning: 3, users: 4 },
  },

  // CRUD Helpers
  save() {
    try {
      localStorage.setItem('sls_state', JSON.stringify(this.state));
      localStorage.setItem('sls_user', JSON.stringify(this.currentUser));
    } catch(e) {}
    // Also keep in memory (fallback for environments where localStorage is blocked)
    window._SLS_STATE = this.state;
    window._SLS_USER = this.currentUser;
  },

  load() {
    // Restore from memory first (same-tab navigation fallback)
    if (window._SLS_STATE) { this.state = window._SLS_STATE; }
    if (window._SLS_USER) { this.currentUser = window._SLS_USER; }
    try {
      const s = localStorage.getItem('sls_state');
      if (s) this.state = JSON.parse(s);
      const u = localStorage.getItem('sls_user');
      if (u) this.currentUser = JSON.parse(u);
    } catch(e) {}
    // If no user found at all, set a default guest so pages don't redirect
    if (!this.currentUser) {
      this.currentUser = { name: 'Admin', email: 'admin@smart.com', role: 'Admin' };
    }
  },

  addHistory(lightId, lightName, action) {
    const entry = {
      id: this.state.nextId.history++,
      lightId, lightName, action,
      user: this.currentUser ? this.currentUser.name : 'Admin',
      timestamp: Date.now()
    };
    this.state.history.unshift(entry);
    this.save();
    return entry;
  },

  toggleLight(id) {
    const light = this.state.lights.find(l => l.id === id);
    if (!light) return;
    light.on = !light.on;
    if (light.on) {
      light.onSince = Date.now();
      light.intensity = light.intensity || 80;
    } else {
      light.onSince = null;
      light.intensity = 0;
    }
    this.addHistory(id, light.name, light.on ? 'ON' : 'OFF');
    this.save();
    return light;
  },

  getAlerts() {
    const alerts = [];
    const threshold = 4 * 3600000; // 4 heures
    this.state.lights.forEach(l => {
      if (l.on && l.onSince && (Date.now() - l.onSince) > threshold) {
        const hours = Math.floor((Date.now() - l.onSince) / 3600000);
        alerts.push({ lightId: l.id, lightName: l.name, hours });
      }
    });
    return alerts;
  },

  getRoomLightCount(roomId) {
    return this.state.lights.filter(l => l.roomId === roomId).length;
  },

  getBuildingRoomCount(buildingId) {
    return this.state.rooms.filter(r => r.buildingId === buildingId).length;
  },

  formatDate(ts) {
    return new Date(ts).toLocaleString('fr-FR');
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('sls_user');
    window.location.href = 'index.html';
  }
};

APP.load();

// ---- Toast ----
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { success: '#22c55e', danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
  toast.style.cssText = `background:${colors[type]||colors.success};color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,.2);font-size:.9rem;max-width:300px;transform:translateX(120%);transition:transform .3s ease;`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.style.transform = 'translateX(0)', 10);
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Confirm modal ----
function confirmAction(msg, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:24px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <h6 style="margin-bottom:12px;font-weight:700;">Confirmation</h6>
      <p style="margin-bottom:20px;color:#555;">${msg}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button id="cf-cancel" style="padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;">Annuler</button>
        <button id="cf-ok" style="padding:8px 16px;border:none;border-radius:6px;background:#ef4444;color:#fff;cursor:pointer;">Confirmer</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('cf-cancel').onclick = () => overlay.remove();
  document.getElementById('cf-ok').onclick = () => { overlay.remove(); onConfirm(); };
}

// ---- Sidebar HTML commun ----
function getSidebar(active) {
  const links = [
    ['dashboard.html','Dashboard','📊'],
    ['buildings.html','Bâtiments','🏢'],
    ['rooms.html','Salles','🚪'],
    ['lights.html','Lampes','💡'],
    ['planning.html','Planning','📅'],
    ['history.html','Historique','📋'],
    ['statistics.html','Statistiques','📈'],
    ['users.html','Utilisateurs','👥'],
  ];
  const alerts = APP.getAlerts().length;
  const alertBadge = alerts > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:50%;padding:1px 6px;font-size:.7rem;margin-left:6px;">${alerts}</span>` : '';
  return `
  <aside class="sidebar p-3">
    <div style="margin-bottom:24px;">
      <h5 style="font-weight:700;margin:0;">💡 Smart Light</h5>
      <small style="color:rgba(255,255,255,.6);">${APP.currentUser ? APP.currentUser.name : 'Admin'}</small>
    </div>
    <ul class="nav flex-column" style="gap:4px;">
      ${links.map(([href, label, icon]) => `
        <li class="nav-item">
          <a href="${href}" class="nav-link ${active===href?'active':''}" style="border-radius:8px;padding:10px 12px;">
            ${icon} ${label}${label==='Dashboard'?alertBadge:''}
          </a>
        </li>`).join('')}
    </ul>
    <div style="margin-top:auto;padding-top:20px;border-top:1px solid rgba(255,255,255,.1);margin-top:20px;">
      <button onclick="APP.logout()" style="background:rgba(239,68,68,.2);color:#fca5a5;border:none;border-radius:8px;padding:10px 12px;width:100%;text-align:left;cursor:pointer;">🚪 Déconnexion</button>
    </div>
  </aside>`;
}