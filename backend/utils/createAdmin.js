import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin' });

    if (!existingAdmin) {
      const hashed = await bcrypt.hash('Admin@123', 10);

      await User.create({
        name: 'Administrator',
        username: 'admin',
        password: hashed,
        role: 'admin'
      });

      console.log('✅ Default admin created (admin / Admin@123)');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('Admin creation error:', err.message);
  }
};

export default createDefaultAdmin;