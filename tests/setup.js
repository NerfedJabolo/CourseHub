// tests/setup.js
import { sequelize } from '../src/models/index.js';

export async function setupDatabase() {
  await sequelize.sync({ force: true });
}

export async function teardownDatabase() {
  await sequelize.close();
}
