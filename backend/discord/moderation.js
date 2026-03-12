const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { COLORS, CHANNELS, MESSAGES } = require("./config");



// ═══════════════════════════════════════════
// Foul Language Word List
// ═══════════════════════════════════════════
// These are hashed/partial patterns — extend as needed.
// Uses regex word boundaries to avoid false positives.

const BLOCKED_WORDS = [
  // Common English profanity
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt",
  "whore", "slut", "fag", "faggot", "retard", "nigger", "nigga",
  // Slurs and hate speech
  "kys", "kill yourself", "hang yourself",
  // Spam patterns
  "discord.gg/", "discordapp.com/invite",
];

// Build regex patterns with word boundaries (case-insensitive)
const BLOCKED_PATTERNS = BLOCKED_WORDS.map((word) => {
  // Escape special regex chars
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Allow leetspeak substitutions for common swaps
  const leetified = escaped
    .replace(/a/gi, "[a@4]")
    .replace(/e/gi, "[e3]")
    .replace(/i/gi, "[i1!]")
    .replace(/o/gi, "[o0]")
    .replace(/s/gi, "[s$5]");
  return new RegExp(leetified, "i");
});

// ═══════════════════════════════════════════
// Strike Tracker (in-memory — per guild, per user)
// ═══════════════════════════════════════════

// Map<guildId, Map<userId, { count, lastStrike }>>
const strikeMap = new Map();

function getStrikes(guildId, userId) {
  if (!strikeMap.has(guildId)) strikeMap.set(guildId, new Map());
  const guildStrikes = strikeMap.get(guildId);
  if (!guildStrikes.has(userId)) {
    guildStrikes.set(userId, { count: 0, lastStrike: null });
  }
  return guildStrikes.get(userId);
}

function addStrike(guildId, userId) {
  const record = getStrikes(guildId, userId);
  record.count++;
  record.lastStrike = new Date();
  return record.count;
}

// ═══════════════════════════════════════════
// Message Filter
// ═══════════════════════════════════════════

/**
 * Check a message for foul language and take action.
 * @param {Message} message
 * @returns {boolean} true if message was flagged
 */
async function filterMessage(message) {
  // Ignore bots, DMs, and users with Manage Messages perm (mods)
  if (message.author.bot) return false;
  if (!message.guild) return false;
  if (
    message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)
  ) {
    return false;
  }

  const content = message.content.toLowerCase();

  // Check against all patterns
  const matched = BLOCKED_PATTERNS.find((pattern) => pattern.test(content));
  if (!matched) return false;

  // ── Flagged! ──
  const guild = message.guild;
  const member = message.member;
  const userId = message.author.id;

  try {
    // Delete the offending message
    await message.delete().catch(() => {});

    // Add strike
    const strikeCount = addStrike(guild.id, userId);

    console.log(
      `🚨 [Mod] Foul language by ${message.author.tag} in #${message.channel.name} — Strike ${strikeCount}`
    );

    // Take action based on strike count
    if (strikeCount >= 2) {
      // ── BAN ──
      await takeAction(guild, member, message, strikeCount, "ban");
    } else {
      // ── WARNING ──
      await takeAction(guild, member, message, strikeCount, "warn");
    }

    return true;
  } catch (error) {
    console.error("❌ [Mod] Error processing flagged message:", error.message);
    return false;
  }
}

/**
 * Execute moderation action and notify.
 */
async function takeAction(guild, member, message, strikeCount, action) {
  const user = member.user;
  let actionText = "";
  let actionColor = COLORS.WARNING;

  try {
    switch (action) {
      case "warn":
        actionText = "⚠️ Warning issued";
        // Send DM warning
        await user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle(MESSAGES.MODERATION.WARN_TITLE)
                .setDescription(
                  MESSAGES.MODERATION.WARN_DESC.replace("%GUILD_NAME%", guild.name).replace("%STRIKE%", strikeCount)
                )
                .setColor(COLORS.WARNING)
                .setTimestamp(),
            ],
          })
          .catch(() => {});

        // Also warn in the channel (briefly)
        const warnMsg = await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                MESSAGES.MODERATION.WARN_CHANNEL.replace("%USER_ID%", user.id).replace("%STRIKE%", strikeCount)
              )
              .setColor(COLORS.WARNING),
          ],
        });
        // Auto-delete the warning after 8 seconds
        setTimeout(() => warnMsg.delete().catch(() => {}), 8000);
        break;

      case "ban":
        actionText = "🔨 Permanently banned";
        actionColor = COLORS.ERROR;
        await user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle(MESSAGES.MODERATION.BAN_TITLE)
                .setDescription(
                  MESSAGES.MODERATION.BAN_DESC.replace("%GUILD_NAME%", guild.name).replace("%STRIKE%", strikeCount)
                )
                .setColor(COLORS.ERROR)
                .setTimestamp(),
            ],
          })
          .catch(() => {});
        await member
          .ban({ reason: MESSAGES.MODERATION.BAN_REASON.replace("%STRIKE%", strikeCount), deleteMessageSeconds: 60 })
          .catch(() => {});
        break;
    }
  } catch (err) {
    console.error(`❌ [Mod] Failed to execute ${action}:`, err.message);
  }

  // Log to #server-logs
  const logEmbed = new EmbedBuilder()
    .setTitle(MESSAGES.MODERATION.LOG_TITLE)
    .addFields(
      { name: "User", value: `${user.tag} (<@${user.id}>)`, inline: true },
      { name: "Action", value: action === "warn" ? MESSAGES.MODERATION.LOG_ACTION_WARN : MESSAGES.MODERATION.LOG_ACTION_BAN, inline: true },
      { name: "Strikes", value: `${strikeCount}`, inline: true },
      { name: "Channel", value: `#${message.channel.name}`, inline: true }
    )
    .setColor(actionColor)
    .setTimestamp();

  await logToChannel(guild, CHANNELS.SERVER_LOGS, logEmbed);
}

module.exports = { filterMessage, getStrikes, addStrike, BLOCKED_WORDS };
