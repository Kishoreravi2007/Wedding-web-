require('dotenv').config();
const { supabase } = require('../lib/supabase');

const ensureClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Set SUPABASE_URL and key.');
  }
  return supabase;
};

const run = async () => {
  try {
    const client = ensureClient();
    const now = new Date().toISOString();

    const { data, error } = await client
      .from('premium_memberships')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_date', now)
      .select('id, user_id, expiry_date');

    if (error) {
      throw error;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log('No premium memberships to expire.');
      return;
    }

    console.log(`Expired ${data.length} memberships.`);

    const notifications = data.map((row) => ({
      user_id: row.user_id,
      title: 'Premium access expired',
      message: `Your premium website builder membership ended on ${new Date(row.expiry_date).toDateString()}.`,
      type: 'premium'
    }));

    const { error: notifyError } = await client
      .from('user_notifications')
      .insert(notifications);

    if (notifyError) {
      console.warn('Failed to insert expiration notifications:', notifyError);
    } else {
      console.log('Posted expiration notifications for users.');
    }
  } catch (error) {
    console.error('Failed to expire premium memberships:', error);
    process.exitCode = 1;
  }
};

run();

