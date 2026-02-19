const { query } = require('../lib/db-gcp');

async function migrate() {
    console.log('🚀 Starting coupons table migration...');

    try {
        await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value NUMERIC(10, 2) NOT NULL,
        min_purchase NUMERIC(10, 2) DEFAULT 0,
        max_discount NUMERIC(10, 2),
        usage_limit INTEGER DEFAULT 100,
        usage_count INTEGER DEFAULT 0,
        expiry_date TIMESTAMPTZ,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

        console.log('✅ Coupons table created or already exists.');

        // Insert some initial data for testing
        const testCoupons = [
            { code: 'WELCOME20', type: 'percentage', value: 20, limit: 100 },
            { code: 'FLAT500', type: 'fixed', value: 500, limit: 50 }
        ];

        for (const coupon of testCoupons) {
            await query(`
        INSERT INTO coupons (code, discount_type, discount_value, usage_limit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [coupon.code, coupon.type, coupon.value, coupon.limit]);
        }

        console.log('✅ Initial test coupons inserted.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
