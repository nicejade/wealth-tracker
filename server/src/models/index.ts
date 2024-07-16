import { Sequelize } from 'sequelize'
import { SQLITE_DB } from '../helper/constant'

// Use Sequelize to connect to SQLite database
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Set SQLite database file
  storage: SQLITE_DB,
})
