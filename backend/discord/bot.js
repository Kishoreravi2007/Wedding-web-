/**
 * Discord Bot Entry Point
 * ─────────────────────────────────────────────
 * This file initializes the Discord.js client, logs in,
 * and keeps the bot running 24/7. It is loaded by server.js
 * via require("./discord/bot") so the bot starts with the backend.
 *
 * 24/7 Rules:
 *   ✅ Starts when backend starts
 *   ✅ Does not exit after HTTP request
 *   ✅ Keeps process alive via client connection
 *   ✅ Auto-reconnects on disconnect
 *   ✅ Logs all lifecycle events
 *   ✅ Heartbeat watchdog for stale connections
 */

const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  EmbedBuilder,
} = require("discord.js");

const { runSetup } = require("./setup");
const { autoAssignUser } = require("./roles");
const { logMemberJoin, logMemberLeave, logError, COLORS } = require("./logger");
const { registerCommands, handleInteraction } = require("./commands");
const { filterMessage } = require("./moderation");
const { CONFIG, CHANNELS, MESSAGES } = require("./config");

// ═══════════════════════════════════════════
// Client Initialization
// ═══════════════════════════════════════════

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

// ═══════════════════════════════════════════
// Lifecycle Events (24/7 stability)
// ═══════════════════════════════════════════

client.once("ready", async () => {
  console.log("═══════════════════════════════════════");
  console.log(`🤖 Discord bot is ONLINE`);
  console.log(`   Logged in as: ${client.user.tag}`);
  console.log(`   Serving ${client.guilds.cache.size} server(s)`);
  console.log(`   Bot ID: ${client.user.id}`);
  console.log("═══════════════════════════════════════");

  // Set presence
  client.user.setPresence({
    activities: [
      {
        name: CONFIG.PRESENCE.ACTIVITY,
        type: ActivityType[CONFIG.PRESENCE.TYPE],
      },
    ],
    status: "online",
  });

  // Register slash commands
  await registerCommands();

  // Run setup for any guilds the bot is already in (catch up after restart)
  for (const guild of client.guilds.cache.values()) {
    console.log(`🔄 [Boot] Verifying setup for existing guild: ${guild.name}`);
    // Only run setup if #server-logs doesn't exist (first time)
    const hasSetup = guild.channels.cache.find(
      (ch) => ch.name === CHANNELS.SERVER_LOGS
    );
    if (!hasSetup) {
      await runSetup(guild);
    } else {
      console.log(`   ✅ ${guild.name} already set up — skipping`);
    }
  }
});

client.on("disconnect", (event) => {
  console.warn(`⚠️  [Bot] Disconnected! Code: ${event?.code || "unknown"}`);
  console.warn("   Bot will attempt to reconnect automatically...");
});

client.on("reconnecting", () => {
  console.log("🔄 [Bot] Reconnecting to Discord...");
});

client.on("error", (error) => {
  console.error("❌ [Bot] Client error:", error.message);
});

client.on("warn", (info) => {
  console.warn("⚠️  [Bot] Warning:", info);
});

// ═══════════════════════════════════════════
// Guild Events
// ═══════════════════════════════════════════

// Bot joins a new server → run full setup
client.on("guildCreate", async (guild) => {
  console.log(`\n🆕 Bot joined new server: ${guild.name} (${guild.id})`);
  await runSetup(guild);
});

// Bot removed from a server
client.on("guildDelete", (guild) => {
  console.log(`🗑️  Bot removed from server: ${guild.name} (${guild.id})`);
});

// ═══════════════════════════════════════════
// Member Events
// ═══════════════════════════════════════════

client.on("guildMemberAdd", async (member) => {
  // 1. Auto-assign "User" role
  await autoAssignUser(member);

  // 2. Log the join
  await logMemberJoin(member);

  // 3. Send welcome message in #general
  try {
    const generalChannel = member.guild.channels.cache.find(
      (ch) => ch.name === "general" && ch.isTextBased()
    );

    if (generalChannel) {
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(MESSAGES.WELCOME.TITLE)
        .setDescription(
          MESSAGES.WELCOME.DESCRIPTION
            .replace("%USER_ID%", member.id)
            .replace("%GUILD_NAME%", member.guild.name) + "\n\n" +
          MESSAGES.WELCOME.TIPS.map(tip => {
            let t = tip;
            if (t.includes("%ANN_ID%")) t = t.replace("%ANN_ID%", member.guild.channels.cache.find(ch => ch.name === CHANNELS.ANNOUNCEMENTS)?.id || CHANNELS.ANNOUNCEMENTS);
            if (t.includes("%RULES_ID%")) t = t.replace("%RULES_ID%", member.guild.channels.cache.find(ch => ch.name === CHANNELS.RULES)?.id || CHANNELS.RULES);
            return t;
          }).join("\n")
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setColor(COLORS.SUCCESS)
        .setTimestamp()
        .setFooter({ text: MESSAGES.WELCOME.FOOTER
          .replace("%BOT_NAME%", CONFIG.BOT_NAME)
          .replace("%COUNT%", member.guild.memberCount) 
        });

      await generalChannel.send({ embeds: [welcomeEmbed] });
    }
  } catch (error) {
    console.error("❌ [Bot] Failed to send welcome message:", error.message);
  }
});

client.on("guildMemberRemove", async (member) => {
  await logMemberLeave(member);
});

// ═══════════════════════════════════════════
// Message Events (Moderation)
// ═══════════════════════════════════════════

client.on("messageCreate", async (message) => {
  // Run foul language filter on every message
  await filterMessage(message);
});

// ═══════════════════════════════════════════
// Interaction Events (Slash commands, buttons, select menus)
// ═══════════════════════════════════════════

client.on("interactionCreate", async (interaction) => {
  try {
    await handleInteraction(interaction);
  } catch (error) {
    console.error("❌ [Bot] Interaction error:", error);

    // Try to respond with error
    const errorMsg = "❌ An error occurred. Please try again.";
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMsg, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMsg, ephemeral: true });
      }
    } catch (replyError) {
      // Ignore — interaction may have expired
    }

    // Log to error channel
    if (interaction.guild) {
      await logError(
        interaction.guild,
        "Interaction Error",
        `Command: ${interaction.commandName || interaction.customId}\nError: ${error.message}`
      );
    }
  }
});

// ═══════════════════════════════════════════
// Heartbeat Watchdog (24/7 keep-alive)
// ═══════════════════════════════════════════

const HEARTBEAT_INTERVAL = 60_000; // 1 minute

setInterval(() => {
  const ping = client.ws.ping;
  if (ping === -1) {
    console.warn("💀 [Heartbeat] WebSocket ping is -1 — connection may be stale");
  } else {
    // Only log every 5 minutes to avoid spam
    const now = Date.now();
    if (!client._lastHeartbeatLog || now - client._lastHeartbeatLog > 300_000) {
      console.log(`💓 [Heartbeat] Bot alive | Ping: ${ping}ms | Guilds: ${client.guilds.cache.size}`);
      client._lastHeartbeatLog = now;
    }
  }
}, HEARTBEAT_INTERVAL);

// ═══════════════════════════════════════════
// Login
// ═══════════════════════════════════════════

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.warn("═══════════════════════════════════════");
  console.warn("⚠️  DISCORD_TOKEN not set in .env");
  console.warn("   Discord bot will NOT start.");
  console.warn("   Add DISCORD_TOKEN to your .env file to enable the bot.");
  console.warn("═══════════════════════════════════════");
} else {
  client
    .login(DISCORD_TOKEN)
    .then(() => {
      console.log("🔑 [Bot] Login successful — connecting to Discord gateway...");
    })
    .catch((error) => {
      console.error("❌ [Bot] Login FAILED:", error.message);
      console.error("   Please check your DISCORD_TOKEN in .env");
    });
}

// ═══════════════════════════════════════════
// Graceful Shutdown
// ═══════════════════════════════════════════

process.on("SIGINT", () => {
  console.log("\n🛑 [Bot] Received SIGINT — shutting down gracefully...");
  client.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 [Bot] Received SIGTERM — shutting down gracefully...");
  client.destroy();
  process.exit(0);
});

// Handle unhandled rejections to prevent crashes
process.on("unhandledRejection", (error) => {
  console.error("❌ [Bot] Unhandled rejection:", error);
});

module.exports = { client };
