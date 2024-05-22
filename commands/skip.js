const { ChannelType, SlashCommandBuilder } = require('discord.js')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('You will skip this thread and the chat will be deleted!'),
	async execute(interaction) {
		interaction.reply({content: `They skipped!`});
		let thread = interaction.channel;
		if (thread.type === ChannelType.GuildPublicThread || thread.type === ChannelType.GuildPrivateThread) {
			thread.delete();
		}
        require('../joinchat').startChat(interaction);
	},
};