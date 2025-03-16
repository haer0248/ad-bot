const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bot.db',
    logging: false
})

sequelize.define('ad', {
    userId: {
        type: Sequelize.DataTypes.STRING
    },
    inviteCode: {
        type: Sequelize.DataTypes.STRING
    },
    postTimestamp: {
        type: Sequelize.DataTypes.STRING
    }
})

sequelize.sync({ alter: true }).then(async () => {
  console.log('資料庫已同步')
  await sequelize.close()
}).catch(console.error)