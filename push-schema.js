import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const uri = 'postgresql://postgres.tobopzxfqkcfxfhkvdap:kanekiken09LL@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
  
  const client = new Client({
    connectionString: uri,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase Pooler over IPv4 (Tokyo) Session Mode!");

    const schema = fs.readFileSync('./database/schema.sql', 'utf-8');
    
    console.log("Running schema...");
    await client.query(schema);
    console.log("Schema pushed successfully!");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.end();
  }
}

run();
