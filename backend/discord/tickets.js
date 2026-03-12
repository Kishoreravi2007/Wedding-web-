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
const { CHANNELS, TICKET_TYPES } = require("./config");


/**
 * Handle the /ticket slash command — sends a select menu.
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleTicketCommand(interaction) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket_type_select")
    .setPlaceholder(MESSAGES.TICKETS.SELECT_PLACEHOLDER)
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
    .setTitle(MESSAGES.TICKETS.OPEN_TITLE)
    .setDescription(
      MESSAGES.TICKETS.OPEN_DESC
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
  const channelName = MESSAGES.TICKETS.CHANNEL_NAME
    .replace("%USER_NAME%", user.username.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .replace("%NUMBER%", ticketNumber);

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
      .setTitle(MESSAGES.TICKETS.WELCOME_TITLE.replace("%EMOJI%", typeInfo.emoji).replace("%NUMBER%", ticketNumber).replace("%LABEL%", typeInfo.label))
      .setDescription(
        MESSAGES.TICKETS.WELCOME_DESC.replace("%USER_ID%", user.id).replace("%LABEL%", typeInfo.label)
      )
      .addFields(
        { name: "Type", value: typeInfo.label, inline: true },
        { name: MESSAGES.TICKETS.PRIORITY_LABEL, value: MESSAGES.TICKETS.PRIORITY_VALUE, inline: true },
        { name: MESSAGES.TICKETS.STATUS_LABEL, value: MESSAGES.TICKETS.STATUS_OPEN, inline: true }
      )
      .setColor(COLORS.TICKET)
      .setTimestamp()
      .setFooter({ text: `Ticket ID: ${ticketNumber}` });

    const closeButton = new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel(MESSAGES.TICKETS.CLOSE_BUTTON)
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🔒");

    const buttonRow = new ActionRowBuilder().addComponents(closeButton);

    await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [buttonRow],
    });

    // Reply to user
    await interaction.update({
      content: MESSAGES.TICKETS.REPLY_CREATED.replace("%CHANNEL_ID%", ticketChannel.id),
      embeds: [],
      components: [],
    });

    // Log the ticket
    await logTicketEvent(
      guild,
      MESSAGES.TICKETS.LOG_OPEN_TITLE,
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
      MESSAGES.TICKETS.LOG_CLOSE_TITLE,
      MESSAGES.TICKETS.LOG_CLOSE_DESC
        .replace("%CHANNEL_NAME%", channel.name)
        .replace("%USER_ID%", interaction.user.id)
        .replace("%COUNT%", messages.size)
    );

    // Send transcript to ticket-logs
    const logsChannel = guild.channels.cache.find(
      (ch) => ch.name === CHANNELS.TICKET_LOGS && ch.isTextBased()
    );
    if (logsChannel) {
      const transcriptEmbed = new EmbedBuilder()
        .setTitle(MESSAGES.TICKETS.TRANSCRIPT_TITLE.replace("%CHANNEL_NAME%", channel.name))
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
      content: MESSAGES.TICKETS.CLOSING_NOTICE,
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
