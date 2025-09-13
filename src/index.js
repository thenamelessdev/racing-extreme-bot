const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, Status, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ContextMenuCommandBuilder, ModalBuilder, ApplicationCommandType, messageLink } = require('discord.js');
const { token } = require('../config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    client.user.setPresence({
        activities: [{ name: "Game coming soon", type: 0}],
        status: "online"
    })
});

// prefix commands

// !ping command
client.on(Events.MessageCreate, (message) => {
    if (message.content == "!ping") {
        message.reply("Pong!");
    }
})

client.login(token);