const { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, Status, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ContextMenuCommandBuilder, ModalBuilder, ApplicationCommandType, messageLink, Guild } = require('discord.js');
const { token, shapesToken } = require('../config.json');
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
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Get access to the server")
        .setDMPermission(false)
        .addStringOption(option =>
            option
            .setName("roblox-username")
            .setDescription("Your roblox username. We will not store this in a database or keep it.")
            .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("astronomy-picture-of-the-day")
        .setDescription("Gives you the today's astronomy picture. Powered by Nasa open api")
        .setDMPermission(false),
    new SlashCommandBuilder()
        .setName("talk-to-beans")
        .setDescription("Talk to a Shape called Beans. Powered my Shapes api")
        .addStringOption(option =>
            option
            .setName("message")
            .setDescription("The message that you want to send")
            .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("dog")
        .setDescription("Gives you a dog picture using my api")
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
    if (interaction.commandName == "ticket-setup"  && interaction.member.roles.cache.has(staffRoleID)) {
        const ticketEmbed = new EmbedBuilder()
            .setTitle("Create ticket")
            .setDescription("Make a ticket by clicking the button below. Please do not abuse this.")
        const ticketButton = new ButtonBuilder()
            .setCustomId("openTicketBtn")
            .setLabel("Open ticket")
            .setStyle(ButtonStyle.Primary)
        const actionRow = new ActionRowBuilder()
            .addComponents(ticketButton)
        interaction.channel.send({ embeds: [ticketEmbed], components: [actionRow] });
        interaction.reply({ content: "Panel sent!", ephemeral: true });
    }
})

// verify command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName === "verify") {
        if (interaction.member.roles.cache.has(verifedRoleID)) {
            await interaction.reply({ content: "You are already verified.", ephemeral: true });
            return;
        }

        const rbxUsername = interaction.options.getString("roblox-username");

        try {
            // Fetch user info
            const getUname = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernames: [rbxUsername] })
            });

            const getUnameData = await getUname.json();

            if (!getUnameData.data || getUnameData.data.length === 0) {

                await interaction.reply({ content: "The username wasn't found.", ephemeral: true });
                return;
            }

            const rbxID = getUnameData.data[0].id;

            const getDescription = await fetch(`https://users.roblox.com/v1/users/${rbxID}`);
            const descriptionData = await getDescription.json();

            const description = descriptionData.description;

            if (description === "RACEVERIFY") {
                await interaction.member.roles.add(verifedRoleID);
                await interaction.member.roles.remove(unveriferRoleID);
                await interaction.reply({ content: "You are verified!", ephemeral: true });
            } else {
                await interaction.reply({
                    content: "Please set `RACEVERIFY` as your Roblox description for verification. You may change it back after verification.",
                    ephemeral: true
                });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "An error occurred while verifying.", ephemeral: true });
        }
    }
});


//astronopy pic command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName == "astronomy-picture-of-the-day") {
        const apiResult = await fetch("https://api.nasa.gov/planetary/apod?api_key=iaWoSgBUgdss8w6gzYfmcsINSxJXw99b3Go5MDSc");
        const apiResultJson = await apiResult.json();
        const title = apiResultJson.title;
        const url = apiResultJson.url;
        const explanation = apiResultJson.explanation;
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`Link: ${url} \nExplanation: ${explanation}`)
        await interaction.reply({ embeds: [embed] });
    }
})

// talk-to-beans command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName == "talk-to-beans") {
        await interaction.deferReply();
        const messagetobeans = interaction.options.getString("message")
        const apiResult = await fetch("https://api.shapes.inc/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${shapesToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({"model": "shapesinc/beans-cc8v", "messages": [{ "role": "user", "content": messagetobeans }]})
        });
        const apiResultjson = await apiResult.json();
        const shapeMsg = apiResultjson.choices[0].message.content;
        try {
            await interaction.editReply(shapeMsg);
        }
        catch {
            await interaction.editReply("The message is too long. Please try again.");
        }
    }
})

// dog command
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.commandName == "dog") {
        const dog = await fetch("http://api.thenamelessdev.com/dog");
        const dogjson = await dog.json();
        interaction.reply(dogjson.image);
    }
})

// events

// welcome message and roles
client.on(Events.GuildMemberAdd, async (member) => {
    const welcomeChannel = await client.channels.fetch(welcomeChannelID);
    await welcomeChannel.send(`<@${member.user.id}> joined the server. Welcome!`);
    await member.roles.add(unveriferRoleID);
    await member.roles.add(jrRacerRoleID);
})

// leave message
client.on(Event.GuildMemberRemove, async (member) => {
    const welcomeChannel = await client.channels.fetch(welcomeChannelID);
    await welcomeChannel.send(`<@${member.user.id}> left the server the server :(`);
})

// delete message
client.on(Events.MessageDelete, async (message) => {
    if (message.author.bot) {
        return
    }
    else {
        if (message.content.includes("@everyone")) {
            const embed = new EmbedBuilder()
                .setTitle(`${message.author.username}:`)
                .setDescription(message.content)
            message.channel.send({ embeds: [embed] })
            return
        }
        message.channel.send(`<@${message.author.id}>: \n${message.content}`);
    }
})

// create ticket button
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.customId == "openTicketBtn") {
const ticketChannel = await interaction.guild.channels.create({
  name: `ticket-${interaction.user.username}`,
  type: 0,
  permissionOverwrites: [
    {
      id: interaction.guild.roles.everyone.id,
      deny: ["ViewChannel"],
    },
    {
      id: interaction.user.id,
      allow: ["ViewChannel", "SendMessages"],
    },
    {
      id: staffRoleID,
      allow: ["ViewChannel", "SendMessages"],
    },
  ],
  reason: `Ticket created by ${interaction.user.tag}`,
});
 ticketEmbed = new EmbedBuilder()
            .setTitle("Ticket")
            .setDescription("Welcome to the ticket! Please use the button below to close the ticket.")
        const closeButton = new ButtonBuilder()
            .setCustomId("closeButton")
            .setLabel("Close ticket")
            .setStyle(ButtonStyle.Primary)
        const actionRow = new ActionRowBuilder()
            .addComponents(closeButton)
        const firstMsg = await ticketChannel.send({ content: `<@&${staffRoleID}> <@${interaction.user.id}>`, embeds: [ticketEmbed], components: [actionRow] });
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

// server prefix command
client.on(Events.MessageCreate, async (message) => {
    if (message.content == "!server") {
        const embed = new EmbedBuilder()
            .setTitle("About server")
            .setDescription(`Server name: ${message.guild.name}`)
            .setImage(message.guild.icon.url)
        message.reply({ embeds: [embed] });
    }
})

client.login(token);