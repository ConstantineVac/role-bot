
const { getDatabase } = require('../database');

module.exports = {
  data: {
    name: 'admin-set-channel',
    description: 'Admin sets a channel for thanking new server boosters',
    options: [
      {
        name: 'action',
        description: 'Choose what to do!',
        type: 3, // STRING
        required: true,
        choices: [
          { name: 'Set Channel', value: 'set' },
          { name: 'Remove Channel', value: 'remove' },
        ],
      },
      {
        name: 'channel',
        description: 'Choose a channel',
        type: 7, // channel
        required: false, // Make the channel option not required
      },
    ],
  },
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel');

    // Get the database reference
    const database = getDatabase();

    try {
      // Navigate to the document with name 'config'
      const boosterRolesCollection = database.collection('boosterRoles');
      const configDocument = await boosterRolesCollection.findOneAndUpdate(
        { name: 'config' },
        { $setOnInsert: { channel: null } }, // Set default values if the document doesn't exist
        { upsert: true, returnDocument: 'after' }
      );

      // Perform actions based on the selected action
      switch (action) {
        case 'set':
          // Set the channel
          await boosterRolesCollection.updateOne(
            { name: 'config' },
            { $set: { channel: channel.id } }
          );
          break;

        case 'remove':
          // Clear the channel field
          await boosterRolesCollection.updateOne(
            { name: 'config' },
            { $unset: { channel: '' } }
          );
          break;

        default:
          interaction.reply('Invalid action.');
          return;
      }

      interaction.reply({ content: `Channel ${action === 'remove' ? 'removed from' : 'set for'} thanking new server boosters!`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply('An error occurred while performing the action.');
    }
  },
};
