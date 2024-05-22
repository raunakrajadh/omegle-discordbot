module.exports = () => {

    const fs = require('fs');
    const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
    const { REST, Routes } = require('discord.js');
    const { token, client_id, guild_id } = require('./config/discordbot.json');
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages
        ]
    });
    client.commands = new Collection();
    const commands = [];

    client.once(Events.ClientReady, readyClient => {
        console.log(`discord: logged in as ${readyClient.user.tag}`);
    });

    require('./joinchat')(client);

    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        const command = require(`./commands/${file}`);
        if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
		} 
        else {
			console.log(`discord: [WARNING] The commands in ${file} is missing a required "data" or "execute" property.`);
		}
    }

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
    
        try {
            await command.execute(interaction);
        } 
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } 
            else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });

    const rest = new REST().setToken(token);
    (async () => {
    	try {
    		console.log(`discord: started refreshing ${commands.length} application (/) commands.`);

    		const data = await rest.put(
    			Routes.applicationGuildCommands(client_id, guild_id),
    			{ body: commands },
    		);

    		console.log(`discord: successfully reloaded ${data.length} application (/) commands.`);
    	} 
        catch (error) {
    		console.error(error);
    	}
    })();

    client.login(token);
};