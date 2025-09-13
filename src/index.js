const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, Status, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ContextMenuCommandBuilder, ModalBuilder, ApplicationCommandType, messageLink } = require('discord.js');
const { token } = require('../config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping] });

// commands
const commands = [
    new SlashCommandBuilder()
        .setName("Ping")
        .setDescription("Just a ping command")
]

client.once(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await client.user.setPresence({
        activities: [{ name: "Game coming soon", type: 0}],
        status: "online"
    })

    const rest = new REST({ version: "10" }).setToken(token);
    try {
        console.log("Registering commands...");
        await rest.put(
            Routes.applicationCommands(readyClient.user.id), // Use applicationCommands for global commands
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log("Commands registered.");
    } catch (error) {
        console.error("There was an error registering commands:", error);
    }

});

// prefix commands

// !ping command
client.on(Events.MessageCreate, (message) => {
    if (message.content == "!ping") {
        message.reply("Pong!");
    }
})

// slash commands

// ping command
client.on(Events.InteractionCreate, (interaction) => {
    if (interaction.commandName == "ping") {
        interaction.reply("Pong!")
    }
})

client.login(token);