const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'db.json');

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], results: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let cache = loadDb();

module.exports = {
  getUsers: () => cache.users,
  getResults: () => cache.results,
  addUser: (user) => {
    cache.users.push(user);
    saveDb(cache);
    return user;
  },
  updateUser: (id, changes) => {
    const user = cache.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, changes);
    saveDb(cache);
    return user;
  },
  findUserByEmail: (email) => cache.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => cache.users.find((u) => u.id === id),
  getPendingUsers: () => cache.users.filter((u) => u.status === 'pending'),
  addResult: (result) => {
    cache.results.push(result);
    saveDb(cache);
    return result;
  },
  getResultsByUser: (userId) => cache.results.filter((r) => r.userId === userId),
};
