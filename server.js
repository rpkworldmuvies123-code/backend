import 'dotenv/config';
import { createApp } from './src/app.js';
import { connectDB } from './src/config/db.js';

const port = Number(process.env.PORT || 5000);
await connectDB();
const app = createApp();
app.listen(port, () => {
  console.log(`BharatTrade API listening on port ${port}`);
});
