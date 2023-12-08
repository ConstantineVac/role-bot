// help.js
module.exports = {
    data: {
      name: 'help',
      description: 'Get help and instructions on using the bot.',
    },
    async execute(interaction) {
      const helpMessage = `
        **How to Create a Custom Role:**
  
        Step 1: Boost the Server
        - Boost the server to become a server booster.
  
        Step 2: Use /claimrole Command
        - Type \`/claimrole claim\` to claim your custom role.
  
        Step 3: Customize Your Role (Optional)
        - You can customize your role by providing additional options:
          - Color: \`/claimrole claim --color [hex code or color name]\`
          - Name: \`/claimrole claim --name [custom role name]\`
          - Icon: \`/claimrole claim --icon [emoji or icon]\`
  
        Example:
        - \`/claimrole claim --color #FFD700 --name VIP --icon 🌟\`
  
        Now you have your custom role with the specified options!
  
        Enjoy your perks!
      `;
  
      interaction.reply({ content: helpMessage, ephemeral: true });
    },
  };
  