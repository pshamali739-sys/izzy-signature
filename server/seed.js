require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('./db/db');

async function seed() {
  const email = (process.env.ADMIN_EMAIL || 'admin@izzy.com').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'izzy2024!';

  const supabase = getDb();

  // Check if admin already exists
  const { data: existing, error: findError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log(`\n✅ Admin user already exists: ${email}\n`);
    process.exit(0);
  }

  const hash = bcrypt.hashSync(password, 12);
  
  const { error: insertError } = await supabase
    .from('admin_users')
    .insert([{ email, password_hash: hash }]);

  if (insertError) {
    console.error('❌ Failed to insert admin user:', insertError.message);
    process.exit(1);
  }

  console.log('\n✨ Admin user created in Supabase!');
  console.log('   Email   :', email);
  console.log('   Password:', password);
  console.log('\n⚠️  Change the password after your first login.\n');
  
  process.exit(0);
}

seed();
