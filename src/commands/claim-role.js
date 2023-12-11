const { getDatabase } = require('../database');

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
    const roleName = interaction.options.getString('name');
    const roleIcon = interaction.options.getString('icon');
    const memberId = interaction.member.id;

    // Get the database reference
    const database = getDatabase();
    const customRolesCollection = database.collection('customRoles');

    try {
      // Check if the user already has a custom role in the database
      const existingCustomRole = await customRolesCollection.findOne({
        userId: memberId,
      });

      //console.log(existingCustomRole)

      if (existingCustomRole && existingCustomRole.roleId) {
        return interaction.reply({
          content: `You already have a custom role. Use <@&${existingCustomRole.roleId}> role instead.`,
          ephemeral: true,
        });
      }

      // Check if a role with the specified name already exists on the server
      const existingRole = interaction.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      );

      if (existingRole) {
        return interaction.reply({
          content: 'A role with this name already exists on the server.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'An error occurred while checking the custom role.',
        ephemeral: true,
      });
      return;
    }

    // Check if the user is a server booster
    if (!interaction.member.premiumSince) {
      return interaction.reply({
        content: 'You are not a server booster.',
        ephemeral: true,
      });
    }

    try {
      // Create the role with specified options or defaults
      const roleOptions = {
        name: roleName || 'Custom Role',
        color: interaction.options.getString('color') || 'BLUE',
      };

      // Create the role
      const createdRole = await interaction.guild.roles.create(roleOptions);

      // Set the role position to be at the top
      await createdRole.setPosition(0);

      // Add the icon to the role name if provided
      if (roleIcon) {
        const emojiMatch = roleIcon.match(/<a?:.+:(\d+)>/);

        if (emojiMatch && emojiMatch[1]) {
          const emojiId = emojiMatch[1];
          roleOptions.name = `${roleOptions.name} <:${emojiId}>`;

          // Set the role icon using the emoji ID
          await createdRole.setIcon(`https://cdn.discordapp.com/emojis/${emojiId}.png`);
        } else {
          roleOptions.name = `${roleOptions.name} ${roleIcon}`;
        }
      }

      // Add the role to the member
      await interaction.member.roles.add(createdRole);

      // Update the custom role information in the database
      await customRolesCollection.insertOne({
        userId: memberId,
        roleId: createdRole.id,
      });

      // Set the booster role position to be at the top
      const boosterRole = interaction.guild.roles.cache.find((role) => role.name === 'Booster');
      if (boosterRole) {
        await boosterRole.setPosition(0);
      }

      interaction.reply({
        content: `Custom role claimed! Your role ID: <@&${createdRole.id}>. Enjoy your perks.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: 'An error occurred while claiming the custom role.',
        ephemeral: true,
      });
    }
  },
};