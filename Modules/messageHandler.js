const Discord = require('discord.js');
const { containsInvalidUrl, extractInviteCodes } = require('./urlChecker');
const { ads } = require('../database');

async function processMessage(message) {
    const maxLength = 100;

    let testChannel = false;
    let isForwardMessage = false;

    // 忽略機器人訊息
    if (message.author.id === process.env.CLIENT_ID) return;
    if (message.author.bot) return;

    // 轉發
    if (message.reference?.channelId) isForwardMessage = true;

    if (!message.content && !isForwardMessage) return;

    // 私訊
    if (message.channel.type === Discord.ChannelType.DM) testChannel = true;

    // 測試頻道
    if (message.channel.id === process.env.AD_TEST_CHANNEL_ID) testChannel = true;

    // 非測試頻道與廣告頻道丟回去
    if (message.channel.id !== process.env.AD_CHANNEL_ID && !testChannel) return;

    const nowTime = Math.floor(new Date().getTime() / 1000);
    const muteTime = 3600000; // 1小時

    const content = message.content;

    // 文字長度
    let processedContent = content.replace(/(\r\n|\n|\r)/g, '');
    const urlPattern = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z\d-]+)?(?:\?\S*)?(?:#\S*)?/g;
    const urls = content.match(urlPattern) || [];
    for (const url of urls) {
        processedContent = processedContent.replace(url, '');
    }

    processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '$1');
    processedContent = processedContent.replace(/(\*|_)(.+?)\1/g, '$2');
    processedContent = processedContent.replace(/```(?:[a-zA-Z]+\n)?(.+?)```/gs, '$1');
    processedContent = processedContent.replace(/`(.+?)`/g, '$1');

    const contentLength = processedContent.length;
    if (contentLength < 0) return;

    const isTooLong = contentLength > maxLength;
    const inviteCodes = extractInviteCodes(content);

    // 權限組
    let botMember = null;
    let canModerate;
    if (testChannel) {
        canModerate = true;
    } else {
        botMember = message.guild.members.me;
        canModerate = message.member.moderatable && botMember.roles.highest.comparePositionTo(message.member.roles.highest) > 0
    }

    if (!canModerate) return;

    let send = true;

    // 如果訊息包含不允許的網址
    if (containsInvalidUrl(content)) {
        send = false;
        if (testChannel) {
            try {
                await message.reply({
                    content: '❌ 廣告內容不通過，內容包含非 \`discord.gg/邀請代碼\` 或 \`discord.com/invite/邀請代碼\` 邀請連結（即便不包含邀請連結同時視為禁止發送連結）。'
                })
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        } else {
            Logger.run('INFO', `${message.author.tag} 發送廣告內容包含不允許的第三方連結。`)
            try {
                await message.delete();
                // await message.member.timeout(muteTime, '發送不允許的網址');
                await message.author.send({
                    content: `警告！目前第三方廣告頻道僅允許使用 \`discord.gg/邀請代碼\` 或 \`discord.com/invite/邀請代碼\` 的其他連結，即便不包含邀請代碼也不允許發送。`
                }).catch(err => {
                    message.channel.send({
                        content: `${message.author.tag} 廣告包含不允許的連結。\n無法發送私訊：請至社群隱私設定 → 私人訊息設定為啟用。`
                    });
                    console.error('無法發送私訊:', err);
                });
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        }
    }

    // 訊息過長
    if (isTooLong) {
        send = false;
        if (testChannel) {
            try {
                await message.reply({
                    content: `❌ 廣告內容不通過，內容長度超出社群限制（${contentLength}/${maxLength}）。`
                })
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        } else {
            Logger.run('INFO', `${message.author.tag} 發送廣告內容超出限制（${contentLength}/${maxLength}）。`)
            try {
                await message.delete();
                // await message.member.timeout(muteTime, '發送長度過長');
                await message.author.send({
                    content: `第三方廣告頻道目前字數限制為 ${maxLength} 字元，您發送的內容長度為 ${contentLength}，請修改訊息後重新發送。`
                }).catch(err => {
                    message.channel.send({
                        content: `${message.author.tag} 廣告內容字數超過限制 (${maxLength})。\n無法發送私訊：請至社群隱私設定 → 私人訊息設定為啟用。`
                    });
                    console.error('無法發送私訊:', err);
                });
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        }
    }

    // 超過一個社群邀請
    if (inviteCodes.length > 1) {
        send = false;
        if (testChannel) {
            try {
                await message.reply({
                    content: `❌ 廣告內容不通過，內容長度包含多個第三方社群邀請連結。`
                })
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        } else {
            Logger.run('INFO', `${message.author.tag} 發送廣告內容包含多個第三方社群邀請連結。`)
            try {
                await message.delete();

                // await message.member.timeout(muteTime, '發送長度過長');
                await message.author.send({
                    content: `第三方廣告頻道目前僅限發送一個社群邀請連結，請修改訊息後重新發送。`
                }).catch(err => {
                    message.channel.send({
                        content: `${message.author.tag} 廣告內容僅限包含一個社群邀請連結。\n無法發送私訊：請至社群隱私設定 → 私人訊息設定為啟用。`
                    });
                    console.error('無法發送私訊:', err);
                });
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        }
    }

    if (isForwardMessage) {
        send = false;
        if (testChannel) {
            try {
                await message.reply({
                    content: `❌ 廣告內容不通過，禁止使用轉發功能。`
                })
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        } else {
            Logger.run('INFO', `${message.author.tag} 發送廣告來自轉發。`)
            try {
                await message.delete();

                // await message.member.timeout(muteTime, '發送長度過長');
                await message.author.send({
                    content: `第三方廣告頻道禁止使用轉發功能來進行規避發佈廣告規則。`
                }).catch(err => {
                    message.channel.send({
                        content: `${message.author.tag} 禁止使用轉發功能來進行規避發佈廣告規則。\n無法發送私訊：請至社群隱私設定 → 私人訊息設定為啟用。`
                    });
                    console.error('無法發送私訊:', err);
                });
            } catch (error) {
                Logger.run('ERROR', error);
                console.error(error);
            }
        }
    }

    if (!send) return;

    if (send && testChannel) {
        try {
            await message.reply({
                content: `✅ 第三方廣告內容通過測試，可以進行發送。`
            })
        } catch (error) {
            Logger.run('ERROR', error);
            console.error(error);
        }
    }

    if (testChannel) return;

    let inviteCode = inviteCodes[0];
    if (inviteCode) {
        let adResult = await ads.findOne({ where: { inviteCode: inviteCode } });

        if (inviteCodes.length > 0) {
            Logger.run('INFO', `使用者 ${message.author.tag} 發送廣告 /${inviteCodes[0]}`);

            try {
                if (adResult) {
                    const newTime = parseInt(adResult.get('postTimestamp')) + 60 * 60 * 24 * 3;
                    calc = newTime - nowTime;

                    let year = Math.floor(calc / (31536000));
                    let cdays = year * 365;
                    let days = Math.floor(calc / (86400)) - cdays;
                    let leave1 = calc % (86400);
                    let hours = Math.floor(leave1 / (3600));
                    let leave2 = leave1 % (3600);
                    let minutes = Math.floor(leave2 / (60));
                    let leave3 = leave2 % (60);
                    let seconds = Math.round(leave3 / 1);

                    if (nowTime - adResult.get('postTimestamp') <= (60 * 60 * 24 * 3)) {
                        await message.delete({ timeout: 1000 });
                        await message.author.send({
                            content: `您還需要等待 ${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒才能發送社群 /${inviteCode} 的廣告。`
                        }).catch(() => {
                            message.reply({
                                content: `${message.author.tag} 廣告內容包含的第三方邀請連結尚未達到冷卻時間。\n無法發送私訊：請至社群隱私設定 → 私人訊息設定為啟用。`
                            })
                        });

                        Logger.run('INFO', `${message.member.user.tag} 重複發佈廣告 /${inviteCode}，前一次 <t:${adResult.get('postTimestamp')}>`);
                    } else {
                        await ads.update({
                            inviteCode: inviteCode,
                            postTimestamp: nowTime
                        }, {
                            where: {
                                userId: message.member.user.id
                            }
                        });
                        Logger.run('INFO', `${message.member.user.tag} 已發佈廣告 /${inviteCode}（同時更新時間）`);
                    }
                } else {
                    // pass
                    await ads.create({
                        userId: message.member.user.id,
                        inviteCode: inviteCode,
                        postTimestamp: nowTime
                    });
                    Logger.run('INFO', `${message.member.user.tag} 已發佈廣告 /${inviteCode}（建立新廣告）`);
                }
            } catch (error) {
                Logger.run('ERROR', error);
            }
        }
    }
}

async function handleMessage(message) {
    await processMessage(message);
}

async function handleMessageUpdate(oldMessage, newMessage) {
    await processMessage(newMessage);
}

module.exports = { handleMessage, handleMessageUpdate };