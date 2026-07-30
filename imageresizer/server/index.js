import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load .env from the repository root to ensure vars are available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
console.log('.env path:', envPath, 'exists:', fs.existsSync(envPath));
dotenv.config({ path: envPath });

// Import app after dotenv has loaded environment variables
const { default: app } = await import('./app.js');

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Smart Image Resizer API listening on ${port}`);
});
