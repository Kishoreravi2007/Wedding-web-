require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Razorpay = require('razorpay');

(async () => {
    console.log('--- Razorpay Debug ---');
    console.log('CWD:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Exists (' + process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...)' : 'MISSING');
    console.log('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Exists' : 'MISSING');

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ Keys missing! Check .env file path and formatting.');
        process.exit(1);
    }

    const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    try {
        console.log('Attempting to create large order (5,75,253 INR)...');
        const order = await rzp.orders.create({
            amount: 57525300,
            currency: 'INR',
            receipt: 'debug_large_test',
            notes: { desc: 'Debug Large Amount' }
        });
        console.log('✅ Large Order Created Successfully:', order.id);
        console.log('Status:', order.status);
    } catch (e) {
        console.error('❌ Large Order Failed:', e.message);
        if (e.error) console.error('Details:', JSON.stringify(e.error, null, 2));
    }
})();
