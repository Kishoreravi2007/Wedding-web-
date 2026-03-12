/**
 * Discord Logger Module
 * Handles logging to Discord channels and console for GCP Cloud Logging.
 */

const { EmbedBuilder } = require("discord.js");

// Color palette for embeds
const COLORS = {
  INFO: 0x3498db,
  SUCCESS: 0x2ecc71,
  WARNING: 0xf39c12,
  ERROR: 0xe74c3c,
  JOIN: 0x9b59b6,
  LEAVE: 0x95a5a6,
  TICKET: 0x1abc9c,
  SYSTEM: 0x2c3e50,
};

/**
 * Send an embed message to a specific channel in a guild.
 * @param {Guild} guild - Discord guild
 * @param {string} channelName - Target channel name (e.g. "server-logs")
 * @param {EmbedBuilder|object} embed - Embed to send
 */
async function logToChannel(guild, channelName, embed) {
  try {
    const channel = guild.channels.cache.find(
      (ch) => ch.name === channelName && ch.isTextBased()
    );

    if (!channel) {
      console.warn(
        `⚠️  [Logger] Channel #${channelName} not found in ${guild.name}`
      );
      return;
    }

    // Accept both plain objects and EmbedBuilder instances
    const embedToSend =
      embed instanceof EmbedBuilder ? embed : new EmbedBuilder(embed);

    await channel.send({ embeds: [embedToSend] });
  } catch (error) {
    console.error(
      `❌ [Logger] Failed to log to #${channelName}:`,
      error.message
    );
  }
}

/**
 * Log a member join event.
 */
async function logMemberJoin(member) {
  const embed = new EmbedBuilder()
    .setTitle("👋 Member Joined")
    .setDescription(`${member.user.tag} joined the server.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "User", value: `<@${member.id}>`, inline: true },
      { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: "Member Count", value: `${member.guild.memberCount}`, inline: true }
    )
    .setColor(COLORS.JOIN)
    .setTimestamp();

  console.log(`👋 [Join] ${member.user.tag} joined ${member.guild.name}`);
  await logToChannel(member.guild, "join-logs", embed);
}

/**
 * Log a member leave event.
 */
async function logMemberLeave(member) {
  const embed = new EmbedBuilder()
    .setTitle("🚪 Member Left")
    .setDescription(`${member.user.tag} left the server.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "User", value: `<@${member.id}>`, inline: true },
      { name: "Member Count", value: `${member.guild.memberCount}`, inline: true }
    )
    .setColor(COLORS.LEAVE)
    .setTimestamp();

  console.log(`🚪 [Leave] ${member.user.tag} left ${member.guild.name}`);
  await logToChannel(member.guild, "join-logs", embed);
}

/**
 * Log an error event.
 */
async function logError(guild, errorTitle, errorMessage) {
  const embed = new EmbedBuilder()
    .setTitle(`❌ ${errorTitle}`)
    .setDescription(`\`\`\`\n${errorMessage}\n\`\`\``)
    .setColor(COLORS.ERROR)
    .setTimestamp();

  console.error(`❌ [Error] ${errorTitle}: ${errorMessage}`);

  if (guild) {
    await logToChannel(guild, "error-logs", embed);
  }
}

/**
 * Log a server-level event.
 */
async function logServerEvent(guild, title, description) {
  const embed = new EmbedBuilder()
    .setTitle(`🔧 ${title}`)
    .setDescription(description)
    .setColor(COLORS.SYSTEM)
    .setTimestamp();

  console.log(`🔧 [Server] ${title}: ${description}`);
  await logToChannel(guild, "server-logs", embed);
}

/**
 * Log a ticket event.
 */
async function logTicketEvent(guild, title, description) {
  const embed = new EmbedBuilder()
    .setTitle(`🎫 ${title}`)
    .setDescription(description)
    .setColor(COLORS.TICKET)
    .setTimestamp();

  console.log(`🎫 [Ticket] ${title}: ${description}`);
  await logToChannel(guild, "ticket-logs", embed);
}

module.exports = {
  COLORS,
  logToChannel,
  logMemberJoin,
  logMemberLeave,
  logError,
  logServerEvent,
  logTicketEvent,
};
