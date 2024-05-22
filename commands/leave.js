const { ChannelType, SlashCommandBuilder } = require('discord.js')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('You will leave this thread and the chat will be deleted!'),
	async execute(interaction) {
		interaction.reply({content: `They left!`});
		let thread = interaction.channel;
		if (thread.type === ChannelType.GuildPublicThread || thread.type === ChannelType.GuildPrivateThread) {
			thread.delete();
		}
	},
};