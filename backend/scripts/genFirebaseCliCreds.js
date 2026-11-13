// Prints a path to a temp service-account JSON file built from backend/.env,
// for use as GOOGLE_APPLICATION_CREDENTIALS by the firebase-tools CLI.
// Usage: export GOOGLE_APPLICATION_CREDENTIALS=$(node scripts/genFirebaseCliCreds.js)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const os = require('os');
const path = require('path');

const creds = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  token_uri: 'https://oauth2.googleapis.com/token',
};

const tmpPath = path.join(os.tmpdir(), `fb-cli-creds-${process.pid}-${Date.now()}.json`);
fs.writeFileSync(tmpPath, JSON.stringify(creds), { mode: 0o600 });
process.stdout.write(tmpPath);
