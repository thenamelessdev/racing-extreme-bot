const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, Status, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ContextMenuCommandBuilder, ModalBuilder, ApplicationCommandType, messageLink, Guild } = require('discord.js');
const { token } = require('../config.json');
const { PermissionOverwriteManager } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping] });
//variables

// verifed role id
const verifedRoleID = "1352581581054803988"; 

// welcome channel id
const welcomeChannelID = "1406207097070288896";

// join role IDs
const unveriferRoleID = "1352581380151709736";
const jrRacerRoleID = "1412486871900229632";

// staff role ID
const staffRoleID = "1350502354285363280";

// commands
const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Just a ping command"),
    new SlashCommandBuilder()
        .setName("say")
        .setDescription("Says some thing")
        .addStringOption(option =>
            option
            .setName("message")
            .setDescription("The message that you want to send")
            .setRequired(true)
        )
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Suggest something for the bot")
        .addStringOption(option => 
            option
            .setName("suggestion")
            .setDescription("The suggestion")
            .setRequired(true)
        )
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("ticket-setup")
        .setDescription("Sends the ticket panel to the currect channel. Staff only")
        .setDMPermission(false)
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

// say command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName == "say") {
        if (interaction.member.roles.cache.has(verifedRoleID))
        {
            const msg = interaction.options.getString("message");
            if (msg.includes("@everyone") || msg.includes("@here")) {
                await interaction.reply({ content: "You can't ping everyone", ephemeral: true });
            }
            else{
                await interaction.channel.send(msg)
                await interaction.reply({ content: "Message sent!", ephemeral: true });
            }
        }
        else {
            interaction.reply({ content: "Please verify before using this command", ephemeral: true });
        }
    }
})

// suggest command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName == "suggest") {
        if (interaction.member.roles.cache.has(verifedRoleID)) {
            const nameless = await client.users.fetch("825412517278646313");
            const suggestion = interaction.options.getString("suggestion");
            await nameless.send(`Suggestion: ${suggestion}`);
            console.log(`Suggestion ${suggestion}`)
            await interaction.reply("Suggested!");
        }
        else {
            await interaction.reply({ content: "You are not verifed", ephemeral: true });
        }
    }
})

// ticket setup command
client.on(Events.InteractionCreate, (interaction) => {
    if (interaction.commandName == "ticket-setup"  && interaction.user.roles.cache.has(staffRoleID)) {
        const ticketEmbed = new EmbedBuilder()
            .setTitle("Create ticket")
            .setDescription("Make a ticket by clicking the button below. Please do not abuse this.")
        const ticketButton = new ButtonBuilder()
            .setCustomId("openTicketBtn")
            .setLabel("Open ticket")
            .setStyle(ButtonStyle.Primary)
        const actionRow = new ActionRowBuilder()
            .addComponents(ticketButton)
        interaction.channel.send({ embeds: [ticketEmbed], compoments: [actionRow] });
        interaction.reply({ content: "Panel sent!", ephemeral: true });
    }
})

// events

// welcome message and roles
client.on(Events.GuildMemberAdd, async (member) => {
    const welcomeChannel = await client.channels.fetch(welcomeChannelID);
    await welcomeChannel.send(`<@${member.user.id}> joined the server. Welcome!`);
})

// leave message
client.on(Event.GuildMemberRemove, async (member) => {
    const welcomeChannel = await client.channels.fetch(welcomeChannelID);
    await welcomeChannel.send(`<@${member.user.id}> left the server the server :(`);
})

// delete message
client.on(Events.MessageDelete, async (message) => {
    if (member.user.bot) {
        return
    }
    else {
        message.channel.send(`<@${message.author.id}>: \n${message.content}`);
    }
})

// create ticket button
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.customId == "openTicketBtn") {
        const ticketChannel = await guild.channels.create({ name: `ticket-${interaction.user.username}`, type: 0, PermissionOverwrites: [
            {
                id: guild.roles.everyone, deny: ["ViewChannel"]
            },
            {
                id: interaction.user.id, allow: ["ViewChannel", "SendMessages"]
            },
            {
                id: staffRoleID, allow: ["ViewChannel", "SendMessages"]
            }
        ] })
        const ticketEmbed = new EmbedBuilder()
            .setTitle("Ticket")
            .setDescription("Welcome to the ticket! Please use the button below to close the ticket.")
        const closeButton = new ButtonBuilder()
            .setCustomId("closeButton")
            .setLabel("Close ticket")
            .setStyle(ButtonStyle.Primary)
        const actionRow = new ActionRowBuilder()
            .addComponents(closeButton)
        const firstMsg = await ticketChannel.send({ content: `<@&${staffRoleID}> <@${interaction.user.id}`, embeds: [ticketEmbed], compoments: [actionRow] });
        await firstMsg.pin()
        await interaction.reply({ content: "Ticket created!", ephemeral: true });
    }
})

// delete ticket button
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.customId == "closeButton") {
        await interaction.reply("Closing ticket...");
        await interaction.channel.delete();
    }
})

client.login(token);