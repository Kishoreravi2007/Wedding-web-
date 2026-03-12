/**
 * Discord Server Auto-Setup Module
 * Creates categories, channels, and roles when bot joins a new guild.
 * Idempotent — skips anything that already exists.
 */

const { ChannelType, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { setupRoles } = require("./roles");
const { logServerEvent, COLORS } = require("./logger");

// Category → Channel definitions
const SERVER_STRUCTURE = {
  INFO: [
    "announcements",
    "rules",
    "about-project",
    "website-link",
    "updates",
  ],
  COMMUNITY: [
    "general",
    "help",
    "feedback",
    "feature-requests",
  ],
  SUPPORT: [
    "support-chat",
    "bug-report",
    "api-issues",
  ],
  TICKETS: [
    "open-ticket",
    "ticket-logs",
  ],
  BOT: [
    "bot-commands",
    "ai-chat",
    "status-check",
    "bot-logs",
  ],
  DEVELOPERS: [
    "dev-chat",
    "backend",
    "frontend",
    "database",
    "errors",
  ],
  ADMIN: [
    "admin-only",
    "deployments",
    "mod-chat",
  ],
  LOGS: [
    "server-logs",
    "join-logs",
    "error-logs",
  ],
};

/**
 * Run the full auto-setup for a guild.
 * @param {Guild} guild
 */
async function runSetup(guild) {
  console.log(`\n🚀 ==============================`);
  console.log(`🚀 Auto-setup started for: ${guild.name}`);
  console.log(`🚀 ==============================\n`);

  const stats = { categoriesCreated: 0, channelsCreated: 0, skipped: 0 };

  try {
    // ──── 1. Create categories and channels ────
    for (const [categoryName, channels] of Object.entries(SERVER_STRUCTURE)) {
      // Find or create category
      let category = guild.channels.cache.find(
        (ch) =>
          ch.name.toUpperCase() === categoryName.toUpperCase() &&
          ch.type === ChannelType.GuildCategory
      );

      if (!category) {
        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: "Auto-setup by bot",
        });
        console.log(`📁 Created category: ${categoryName}`);
        stats.categoriesCreated++;
      } else {
        console.log(`📁 Category "${categoryName}" already exists — skipping`);
        stats.skipped++;
      }

      // Create channels under this category
      for (const channelName of channels) {
        const exists = guild.channels.cache.find(
          (ch) =>
            ch.name === channelName &&
            ch.parentId === category.id
        );

        if (exists) {
          console.log(`   ✅ #${channelName} already exists`);
          stats.skipped++;
          continue;
        }

        // ADMIN and LOGS categories get restricted permissions
        const permissionOverwrites = [];
        if (["ADMIN", "LOGS"].includes(categoryName)) {
          permissionOverwrites.push(
            {
              id: guild.id, // @everyone
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: guild.client.user.id, // Bot
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
              ],
            }
          );

          // Allow Admin role if it exists
          const adminRole = guild.roles.cache.find((r) => r.name === "Admin");
          if (adminRole) {
            permissionOverwrites.push({
              id: adminRole.id,
              allow: [PermissionsBitField.Flags.ViewChannel],
            });
          }

          // Allow Moderator role for LOGS
          if (categoryName === "LOGS") {
            const modRole = guild.roles.cache.find((r) => r.name === "Moderator");
            if (modRole) {
              permissionOverwrites.push({
                id: modRole.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
              });
            }
          }
        }

        await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites:
            permissionOverwrites.length > 0 ? permissionOverwrites : undefined,
          reason: "Auto-setup by bot",
        });

        console.log(`   🆕 Created #${channelName}`);
        stats.channelsCreated++;
      }
    }

    // ──── 2. Create roles ────
    await setupRoles(guild);

    // ──── 3. Send confirmation ────
    const summaryEmbed = new EmbedBuilder()
      .setTitle("✅ Server Auto-Setup Complete!")
      .setDescription("Your server has been fully configured by the bot.")
      .addFields(
        { name: "Categories Created", value: `${stats.categoriesCreated}`, inline: true },
        { name: "Channels Created", value: `${stats.channelsCreated}`, inline: true },
        { name: "Skipped (Existing)", value: `${stats.skipped}`, inline: true }
      )
      .setColor(COLORS.SUCCESS)
      .setTimestamp()
      .setFooter({ text: "Discord Automation Bot" });

    await logServerEvent(
      guild,
      "Server Setup Complete",
      `Categories: ${stats.categoriesCreated} new | Channels: ${stats.channelsCreated} new | Skipped: ${stats.skipped}`
    );

    // Also try to post in #general
    const generalChannel = guild.channels.cache.find(
      (ch) => ch.name === "general" && ch.isTextBased()
    );
    if (generalChannel) {
      await generalChannel.send({ embeds: [summaryEmbed] });
    }

    console.log(`\n✅ Setup complete for: ${guild.name}`);
    console.log(
      `   ${stats.categoriesCreated} categories, ${stats.channelsCreated} channels created, ${stats.skipped} skipped\n`
    );
  } catch (error) {
    console.error(`❌ [Setup] Error during setup for ${guild.name}:`, error);
    const { logError } = require("./logger");
    await logError(guild, "Setup Error", error.message);
  }
}

module.exports = { runSetup, SERVER_STRUCTURE };
