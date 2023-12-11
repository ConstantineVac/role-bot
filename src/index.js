require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { connect, getDatabase } = require('./database');  // Import the connect function from the database module
const TicTacToe = require("discord-tictactoe")


const token = process.env.TOKEN;
const clientId = process.env.CLIENT;
const guildId = process.env.GUILD;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Map();

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../src/commands/${file}`);
  commands.push(command.data);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('✅ Bot is online!');
    
    // Connect to the database
    await connect();

    console.log('Started refreshing application (/) commands.');

    // Get the list of guilds the bot is in
    const guilds = client.guilds.cache;

    // Loop over each guild and refresh the commands
    for (const guild of guilds.values()) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guild.id),
        { body: commands },
      );
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();


// Commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (!client.commands.has(commandName)) return;

  try {
    await client.commands.get(commandName).execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply('An error occurred while executing the command.');
  }
});

// Print a message to the member that boosted the server.
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const doc = await getDatabase().collection('boosterRoles').findOne({ name: 'config' });
  const channelId = doc.channel;
  const channel = client.channels.cache.get(channelId);
  //console.log(channel);
  const wasBoosting = oldMember.premiumSince;
  const isBoosting = newMember.premiumSince;

  if (!wasBoosting && isBoosting) {
    let embed = new EmbedBuilder()
      .setTitle("Booster Perks:")
      .addFields(
        {name:`Create your role:`,value: "you can create your own role just by using this command ``/claimrole claim`` ",},
        {name:`Server Boost Count: ${newMember.guild.premiumSubscriptionCount}`,value:" " }
      )
      .setColor("#A020F0")
      .setThumbnail(newMember.user.avatarURL({dynamic:true}))
      .setImage(`https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/204764677/original/ead7150766a962e3d7583aa9b99636b35b6937f4/boost-your-discord-server.png`)
    channel.send({ ephemeral:true,embeds:[embed], content:`${newMember} thank you for boosting this server💖.\nThese are the instructions on how to make your custom role.`})
  }
});

// TicTacToe game.
new TicTacToe({
  token:token,
  language:"en",
  command:"tictactoe",
  commandOptionName:"opponent",
  textCommand:"!ttt",
  aiDifficulty:"Hard"
 }).login().then(()=> console.log("TicTacToe Up & running"))


client.login(token);
