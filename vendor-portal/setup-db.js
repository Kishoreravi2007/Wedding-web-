const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('pooler') ? false : { rejectUnauthorized: false }
});

async function setupDatabase() {
  console.log('🚀 Starting Vendor Portal database setup...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('📦 Creating vendors table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        referral_code TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    console.log('📦 Creating customers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
        package TEXT,
        status TEXT DEFAULT 'pending',
        website_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    console.log('🔒 Enabling RLS...');
    await client.query('ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE customers ENABLE ROW LEVEL SECURITY;');

    console.log('🛡️ Creating RLS policies...');
    // Drop existing if any to avoid errors on re-run
    await client.query('DROP POLICY IF EXISTS vendor_view_own_profile ON vendors;');
    await client.query('CREATE POLICY vendor_view_own_profile ON vendors FOR SELECT USING (auth.uid() = id);');

    await client.query('DROP POLICY IF EXISTS vendor_view_own_customers ON customers;');
    await client.query('CREATE POLICY vendor_view_own_customers ON customers FOR SELECT USING (auth.uid() = vendor_id);');

    await client.query('DROP POLICY IF EXISTS vendor_insert_own_customers ON customers;');
    await client.query('CREATE POLICY vendor_insert_own_customers ON customers FOR INSERT WITH CHECK (auth.uid() = vendor_id);');

    await client.query('DROP POLICY IF EXISTS vendor_update_own_customers ON customers;');
    await client.query('CREATE POLICY vendor_update_own_customers ON customers FOR UPDATE USING (auth.uid() = vendor_id);');

    // Trigger to auto-create vendor profile on signup
    console.log('⚡ Setting up Auth sync trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_vendor() 
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.vendors (id, name, email, referral_code)
        VALUES (
          new.id, 
          COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
          new.email,
          upper(substring(md5(random()::text) from 1 for 8))
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    await client.query('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    await client.query(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();
    `);

    await client.query('COMMIT');
    console.log('✅ Vendor Portal database setup complete!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Database setup failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
