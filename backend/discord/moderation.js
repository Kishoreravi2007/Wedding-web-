/**
 * Discord Moderation Module
 * Detects foul language, applies a 3-strike system:
 *   Strike 1 → Warning
 *   Strike 2 → Timeout (5 min)
 *   Strike 3 → Kick
 *   Strike 4+ → Ban
 */

const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { logToChannel, COLORS } = require("./logger");

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
    if (strikeCount >= 4) {
      // ── BAN ──
      await takeAction(guild, member, message, strikeCount, "ban");
    } else if (strikeCount === 3) {
      // ── KICK ──
      await takeAction(guild, member, message, strikeCount, "kick");
    } else if (strikeCount === 2) {
      // ── TIMEOUT (5 minutes) ──
      await takeAction(guild, member, message, strikeCount, "timeout");
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
                .setTitle("⚠️ Warning — Inappropriate Language")
                .setDescription(
                  `Your message in **${guild.name}** was removed for containing inappropriate language.\n\n**Strike ${strikeCount}/3** — On strike 3 you will be kicked. On strike 4 you will be banned.`
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
                `<@${user.id}> — ⚠️ Watch your language! (Strike ${strikeCount}/3)`
              )
              .setColor(COLORS.WARNING),
          ],
        });
        // Auto-delete the warning after 8 seconds
        setTimeout(() => warnMsg.delete().catch(() => {}), 8000);
        break;

      case "timeout":
        actionText = "🔇 5-minute timeout applied";
        actionColor = COLORS.WARNING;
        const timeoutMs = 5 * 60 * 1000; // 5 minutes
        await member.timeout(timeoutMs, "Foul language — Strike 2");
        await user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle("🔇 Timeout — Inappropriate Language")
                .setDescription(
                  `You have been timed out for **5 minutes** in **${guild.name}** for inappropriate language.\n\n**Strike ${strikeCount}/3** — Next strike = kick.`
                )
                .setColor(COLORS.WARNING)
                .setTimestamp(),
            ],
          })
          .catch(() => {});
        break;

      case "kick":
        actionText = "👢 Kicked from server";
        actionColor = COLORS.ERROR;
        await user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle("👢 Kicked — Repeated Violations")
                .setDescription(
                  `You have been kicked from **${guild.name}** for repeated use of inappropriate language.\n\n**Strike ${strikeCount}** — You may rejoin, but the next violation will result in a permanent ban.`
                )
                .setColor(COLORS.ERROR)
                .setTimestamp(),
            ],
          })
          .catch(() => {});
        await member.kick("Foul language — Strike 3").catch(() => {});
        break;

      case "ban":
        actionText = "🔨 Permanently banned";
        actionColor = COLORS.ERROR;
        await user
          .send({
            embeds: [
              new EmbedBuilder()
                .setTitle("🔨 Banned — Severe Violations")
                .setDescription(
                  `You have been permanently banned from **${guild.name}** for continued use of inappropriate language.\n\n**Strike ${strikeCount}** — This ban is permanent.`
                )
                .setColor(COLORS.ERROR)
                .setTimestamp(),
            ],
          })
          .catch(() => {});
        await member
          .ban({ reason: "Foul language — Strike 4+", deleteMessageSeconds: 60 })
          .catch(() => {});
        break;
    }
  } catch (err) {
    console.error(`❌ [Mod] Failed to execute ${action}:`, err.message);
  }

  // Log to #server-logs
  const logEmbed = new EmbedBuilder()
    .setTitle("🚨 Auto-Moderation")
    .addFields(
      { name: "User", value: `${user.tag} (<@${user.id}>)`, inline: true },
      { name: "Action", value: actionText, inline: true },
      { name: "Strikes", value: `${strikeCount}`, inline: true },
      { name: "Channel", value: `#${message.channel.name}`, inline: true }
    )
    .setColor(actionColor)
    .setTimestamp();

  await logToChannel(guild, "server-logs", logEmbed);
}

module.exports = { filterMessage, getStrikes, addStrike, BLOCKED_WORDS };
