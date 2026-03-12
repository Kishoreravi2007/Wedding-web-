/**
 * Discord Ticket System Module
 * Provides /ticket slash command with select menu, private channels, and close button.
 */

const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { logTicketEvent, COLORS } = require("./logger");

// Ticket counter per guild (in-memory — use DB for production persistence)
const ticketCounters = new Map();

const TICKET_TYPES = [
  { label: "Support",  value: "support",  emoji: "💬", description: "General support request" },
  { label: "Bug",      value: "bug",      emoji: "🐛", description: "Report a bug or issue" },
  { label: "Payment",  value: "payment",  emoji: "💳", description: "Payment or billing issue" },
  { label: "API",      value: "api",      emoji: "🔌", description: "API-related question" },
  { label: "Other",    value: "other",    emoji: "📝", description: "Other inquiry" },
];

/**
 * Handle the /ticket slash command — sends a select menu.
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleTicketCommand(interaction) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket_type_select")
    .setPlaceholder("Select ticket type...")
    .addOptions(
      TICKET_TYPES.map((t) => ({
        label: t.label,
        value: t.value,
        emoji: t.emoji,
        description: t.description,
      }))
    );

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const embed = new EmbedBuilder()
    .setTitle("🎫 Open a Ticket")
    .setDescription(
      "Select the type of issue you need help with from the dropdown below."
    )
    .setColor(COLORS.TICKET)
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  });
}

/**
 * Handle ticket type selection from the select menu.
 * @param {StringSelectMenuInteraction} interaction
 */
async function handleTicketSelect(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  const ticketType = interaction.values[0];

  // Get or init counter
  let counter = ticketCounters.get(guild.id) || 0;
  counter++;
  ticketCounters.set(guild.id, counter);

  const ticketNumber = String(counter).padStart(3, "0");
  const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${ticketNumber}`;

  try {
    // Find TICKETS category
    const ticketsCategory = guild.channels.cache.find(
      (ch) =>
        ch.name.toUpperCase() === "TICKETS" &&
        ch.type === ChannelType.GuildCategory
    );

    // Create private ticket channel
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: ticketsCategory ? ticketsCategory.id : undefined,
      permissionOverwrites: [
        {
          id: guild.id, // @everyone — deny
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id, // Ticket creator — allow
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: guild.client.user.id, // Bot — allow
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ManageChannels,
          ],
        },
      ],
      reason: `Ticket opened by ${user.tag}`,
    });

    // Also allow Support and Admin roles
    for (const roleName of ["Support", "Admin", "Moderator"]) {
      const role = guild.roles.cache.find((r) => r.name === roleName);
      if (role) {
        await ticketChannel.permissionOverwrites.create(role, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
        });
      }
    }

    // Send welcome embed with close button
    const typeInfo = TICKET_TYPES.find((t) => t.value === ticketType);

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`${typeInfo.emoji} Ticket #${ticketNumber} — ${typeInfo.label}`)
      .setDescription(
        `Hello <@${user.id}>!\n\nYour **${typeInfo.label}** ticket has been created.\nPlease describe your issue in detail and a team member will assist you shortly.`
      )
      .addFields(
        { name: "Type", value: typeInfo.label, inline: true },
        { name: "Priority", value: "Normal", inline: true },
        { name: "Status", value: "🟢 Open", inline: true }
      )
      .setColor(COLORS.TICKET)
      .setTimestamp()
      .setFooter({ text: `Ticket ID: ${ticketNumber}` });

    const closeButton = new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔒");

    const buttonRow = new ActionRowBuilder().addComponents(closeButton);

    await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [buttonRow],
    });

    // Reply to user
    await interaction.update({
      content: `✅ Your ticket has been created: <#${ticketChannel.id}>`,
      embeds: [],
      components: [],
    });

    // Log the ticket
    await logTicketEvent(
      guild,
      "Ticket Opened",
      `**User:** <@${user.id}>\n**Type:** ${typeInfo.label}\n**Channel:** <#${ticketChannel.id}>\n**Ticket:** #${ticketNumber}`
    );
  } catch (error) {
    console.error("❌ [Tickets] Failed to create ticket:", error);
    await interaction.update({
      content: "❌ Failed to create ticket. Please contact an admin.",
      embeds: [],
      components: [],
    });
  }
}

/**
 * Handle ticket close button press.
 * @param {ButtonInteraction} interaction
 */
async function handleTicketClose(interaction) {
  const channel = interaction.channel;
  const guild = interaction.guild;

  try {
    // Build transcript (last 100 messages)
    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages
      .reverse()
      .map(
        (msg) =>
          `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content || "(embed/attachment)"}`
      )
      .join("\n");

    // Log closure
    await logTicketEvent(
      guild,
      "Ticket Closed",
      `**Channel:** #${channel.name}\n**Closed by:** <@${interaction.user.id}>\n**Messages:** ${messages.size}`
    );

    // Send transcript to ticket-logs
    const logsChannel = guild.channels.cache.find(
      (ch) => ch.name === "ticket-logs" && ch.isTextBased()
    );
    if (logsChannel) {
      const transcriptEmbed = new EmbedBuilder()
        .setTitle(`📋 Ticket Transcript — #${channel.name}`)
        .setDescription(
          transcript.length > 4000
            ? transcript.substring(0, 4000) + "\n... (truncated)"
            : transcript || "(no messages)"
        )
        .setColor(COLORS.WARNING)
        .setTimestamp();

      await logsChannel.send({ embeds: [transcriptEmbed] });
    }

    // Notify and delete channel
    await interaction.reply({
      content: "🔒 This ticket will be closed in 5 seconds...",
    });

    setTimeout(async () => {
      try {
        await channel.delete("Ticket closed");
      } catch (err) {
        console.error("❌ [Tickets] Failed to delete channel:", err.message);
      }
    }, 5000);
  } catch (error) {
    console.error("❌ [Tickets] Error closing ticket:", error);
    await interaction.reply({
      content: "❌ Failed to close ticket. Please delete the channel manually.",
      ephemeral: true,
    });
  }
}

module.exports = {
  handleTicketCommand,
  handleTicketSelect,
  handleTicketClose,
  TICKET_TYPES,
};
