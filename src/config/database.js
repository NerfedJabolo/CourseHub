module.exports = {
  development: {
    username: 'coursehub_user',
    password: 'secret123',
    database: 'coursehub_dev',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL,
  },
};
