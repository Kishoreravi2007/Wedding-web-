const { EmbedBuilder } = require("discord.js");
const { COLORS, CHANNELS, MESSAGES } = require("./config");


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
    .setTitle(MESSAGES.LOGS.JOIN_TITLE)
    .setDescription(MESSAGES.LOGS.JOIN_DESC.replace("%TAG%", member.user.tag))
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "User", value: `<@${member.id}>`, inline: true },
      { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: "Member Count", value: `${member.guild.memberCount}`, inline: true }
    )
    .setColor(COLORS.JOIN)
    .setTimestamp();

  console.log(`👋 [Join] ${member.user.tag} joined ${member.guild.name}`);
  await logToChannel(member.guild, CHANNELS.JOIN_LOGS, embed);
}

/**
 * Log a member leave event.
 */
async function logMemberLeave(member) {
  const embed = new EmbedBuilder()
    .setTitle(MESSAGES.LOGS.LEAVE_TITLE)
    .setDescription(MESSAGES.LOGS.LEAVE_DESC.replace("%TAG%", member.user.tag))
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "User", value: `<@${member.id}>`, inline: true },
      { name: "Member Count", value: `${member.guild.memberCount}`, inline: true }
    )
    .setColor(COLORS.LEAVE)
    .setTimestamp();

  console.log(`🚪 [Leave] ${member.user.tag} left ${member.guild.name}`);
  await logToChannel(member.guild, CHANNELS.JOIN_LOGS, embed);
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
    await logToChannel(guild, CHANNELS.ERROR_LOGS, embed);
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
  await logToChannel(guild, CHANNELS.SERVER_LOGS, embed);
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
  await logToChannel(guild, CHANNELS.TICKET_LOGS, embed);
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

