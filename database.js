const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bot.db',
    logging: false
})

const ads = sequelize.define('ad', {
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

sequelize.sync({ alter: true })
.then(async () => {
    console.log('資料庫已同步')
}).catch((error) => {
    console.error(error)
})

module.exports = {
    ads
}