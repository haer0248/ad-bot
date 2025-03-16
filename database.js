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
});

module.exports = {
    ads
}