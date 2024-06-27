module.exports = (client) => {
	
    const { Events, ChannelType, ThreadAutoArchiveDuration } = require('discord.js');
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
    const { guild_id, channel_id } = require('./config/discordbot.json');

    let threadQueue = [];
    let _channel;
    let _message;
    let chatCount = 0;

    let context_embed = new EmbedBuilder().setImage('https://media.discordapp.net/attachments/1210891432051744839/1240283735736324147/ezgif-2-b8fb76ac6d.gif?ex=667e077d&is=667cb5fd&hm=e3c6b51ce54c7eecb48ba71bf98987c3297cc4a791d17f6c4ccfe40ac52e0f36&=');
    let stats_message = (_totalChats) => {return `> * \`${_totalChats}\` Chats Since Uptime`};

    const chatWithARandomPerson = new ButtonBuilder()
        .setCustomId('chatwitharandomperson')
        .setLabel('Chat with a random person')
        .setEmoji('1214847091155669002')
        .setStyle(ButtonStyle.Primary);

    const howDoILeave = new ButtonBuilder()
        .setCustomId('howdoileave')
        .setLabel('How do I leave?')
        .setStyle(ButtonStyle.Secondary);

    client.on(Events.ClientReady, async readyClient => {

        _channel = readyClient.channels.cache.get(channel_id);

        const fetched = await _channel.messages.fetch({limit: 99})
        _channel.bulkDelete(fetched)

        await _channel.send({
            embeds: [context_embed]
        })
        _message = await _channel.send({
            content: stats_message(chatCount), 
            components: [new ActionRowBuilder().addComponents(chatWithARandomPerson)]
        })

        setInterval(() => {
            _channel.threads.cache.forEach((thread) => {
                let memberList = [];
                thread.members.cache.forEach((member) => {
                    memberList.push(member.id)
                })
                setTimeout(() => {
                    if(memberList.length < 2){
                        thread.delete()
                    }
                })
            })
        }, 1000*60*10) //every 10 mins
    });

    async function startChat(interaction){
        try {
            interaction.deferUpdate();
        } catch (error) {};
    
        if(threadQueue.length >=1){
    
            let toMatch = threadQueue.pop();
            let thread = _channel.threads.cache.find((t)=> t.id == toMatch.threadId);
    
            if(thread && toMatch.firstUserId !== interaction.user.id){
                await thread.members.add(interaction.user.id);
                thread.messages.cache.find((msg) => msg == toMatch.messageId).delete();
                thread.send({
                    content: `<@${toMatch.firstUserId}>, <@${interaction.user.id}>\n‎\n## 👋 Say hello!\n‎`,
                })
                chatCount++
                _message.edit({content: stats_message(chatCount)});
            }
        }
        else{
            await _channel.threads.create({
                name: `Your chat`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                type: ChannelType.PrivateThread,
                invitable: false
            })
            .then(async (thread) => {
                await thread.members.add(interaction.user);
                let pwMsg = await thread.send({
                    content: `<@${interaction.user.id}>\n‎\n## ⌛ Please wait..\n‎`, 
                })
                threadQueue.push(
                    {
                        threadId: thread.id,
                        firstUserId: interaction.user.id,
                        messageId: pwMsg.id
                    }
                );
            });			
        }
    }
    module.exports = {startChat: function(interaction){startChat(interaction)}}

    client.on(Events.InteractionCreate, async interaction => {

        if (!interaction.isButton()) return;
        
        if (interaction.customId === 'chatwitharandomperson') {
            const threads = await interaction.channel.threads.fetch();
            const isUserInThread = threads.threads.some(thread => thread.members.cache.has(interaction.user.id));

            if (isUserInThread) {
                let threadId = threads.threads.find(thread => thread.members.cache.has(interaction.user.id)).id;
                interaction.reply({
                    content: `## You are already in a chat  ⛔\nPlease leave that thread before joining another!\nYour chat: <#${threadId}>\n‎`, 
                    components: [new ActionRowBuilder().addComponents(howDoILeave)],
                    ephemeral: true,

                })
            } 
            else startChat(interaction);
        }

        if(interaction.customId === 'howdoileave'){
            interaction.reply({
                content: `> * To leave use \`/leave\` application (/) command in your chat`,
                ephemeral: true
            })
        }
    });

    client.on(Events.ThreadMembersUpdate, (joinData, leaveData) => {
        let leaveUser = leaveData.map(i=>i.user);
        let userId = leaveUser.join(" ").slice(2, leaveUser.join(" ").length-1);
        let user = client.guilds.cache.get(guild_id).members.cache.get(userId);

        if(user){

            let threadId = leaveData.map(i=>i.thread).join(" ").slice(2, leaveData.map(i=>i.thread).join(" ").length-1);
            let thread =  _channel.threads.cache.find((t) => t.id == threadId);

            if (thread.type === ChannelType.GuildPublicThread || thread.type === ChannelType.GuildPrivateThread) {
                thread.delete();
            }
        }
    });
};
