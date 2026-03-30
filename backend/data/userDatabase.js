import crypto from 'crypto';

// Helper functions for password hashing and verification
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hashed = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: hashed };
}

function verifyPassword(password, salt, hash) {
  const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');
  return hashedPassword === hash;
}

// Default admin user (immutable credential semantics in application logic)
const defaultAdminUsername = 'admin';
const defaultAdminName = 'Administrator';
const defaultAdminPassword = 'Admin@123';
const defaultAdminRole = 'admin';

const adminPasswordData = hashPassword(defaultAdminPassword);

const users = [
  {
    id: crypto.randomUUID(),
    name: defaultAdminName,
    username: defaultAdminUsername,
    role: defaultAdminRole,
    passwordHash: adminPasswordData.hash,
    salt: adminPasswordData.salt,
    immutable: true
  }
];

function getUserByUsername(username) {
  return users.find(user => user.username === username);
}

function createUser({ name, username, password }) {
  if (getUserByUsername(username)) {
    throw new Error('Username already exists');
  }
  const passwordData = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name,
    username,
    role: 'user',
    passwordHash: passwordData.hash,
    salt: passwordData.salt,
    immutable: false
  };
  users.push(user);
  return user;
}

function validateCredentials(username, password) {
  const user = getUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.salt, user.passwordHash)) return null;
  return user;
}

function listUsers() {
  return users.map(({ id, name, username, role, immutable }) => ({ id, name, username, role, immutable }));
}

export {
  getUserByUsername,
  createUser,
  validateCredentials,
  listUsers,
  defaultAdminUsername,
  defaultAdminPassword
};
