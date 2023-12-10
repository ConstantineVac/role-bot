module.exports = {
  data: {
    name: 'claimrole',
    description: 'Claim your custom role as a server booster.',
    options: [
      {
        name: 'claim',
        description: 'Claim a custom role',
        type: 1, // SUB_COMMAND
        options: [
          {
            name: 'color',
            description: 'Set the color of the role (hex code or color name)',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'name',
            description: 'Set the name of the role',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'icon',
            description: 'Set the icon of the role (emoji or icon)',
            type: 3, // STRING
            required: false,
          },
        ],
      },
    ],
  },
  async execute(interaction) {
    const claimOption = interaction.options.getSubcommand();
    const roleColor = interaction.options.getString('color');
    const roleName = interaction.options.getString('name');
    const roleIcon = interaction.options.getString('icon');

    // const boosterRole = interaction.guild.roles.cache.find(
    //   (role) => role.name === 'Booster',
    // );

    // if (!boosterRole) {
    //   return interaction.reply('The server does not have a "Booster" role.');
    // }

    if (!interaction.member.premiumSince) {
      return interaction.reply({content: 'You are not a server booster.', ephemeral: true});
    }

    try {
      // Create the role with specified options or defaults
      const roleOptions = {
        name: roleName || 'Custom Role',
        color: roleColor || 'BLUE',
      };

      // Create the role
      const createdRole = await interaction.guild.roles.create(roleOptions);

      // Add the icon to the role name if provided
      if (roleIcon) {
        console.log(roleIcon)
        // Check if roleIcon is a custom emoji (e.g., <:emojiName:emojiID>)
        const emojiMatch = roleIcon.match(/<a?:.+:(\d+)>/);

        if (emojiMatch && emojiMatch[1]) {
          const emojiId = emojiMatch[1];
          roleOptions.name = `${roleOptions.name} <:${emojiId}>`;

          // Set the role icon using the emoji ID
          await createdRole.setIcon(`https://cdn.discordapp.com/emojis/${emojiId}.png`);
          console.log(emojiId);
        } else {
          roleOptions.name = `${roleOptions.name} ${roleIcon}`;
        }
      }

      // Add the role to the member
      await interaction.member.roles.add(createdRole);

      interaction.reply('Custom role claimed! Enjoy your perks.');
    } catch (error) {
      console.error(error);
      interaction.reply('An error occurred while claiming the custom role.');
    }
  },
};
