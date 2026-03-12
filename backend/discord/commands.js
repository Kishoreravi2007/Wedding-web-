/**
 * Discord Slash Commands Module
 * Registers and handles: /ticket, /status
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  REST,
  Routes,
} = require("discord.js");
const axios = require("axios");
const { handleTicketCommand } = require("./tickets");
const { COLORS } = require("./logger");

// ═══════════════════════════════════════════
// Command Definitions
// ═══════════════════════════════════════════

const commands = [
  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open a support ticket"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check the status of all connected services"),
];

// ═══════════════════════════════════════════
// Register Slash Commands with Discord API
// ═══════════════════════════════════════════

async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token || !clientId) {
    console.warn(
      "⚠️  [Commands] DISCORD_TOKEN or CLIENT_ID not set — skipping slash command registration"
    );
    return;
  }

  try {
    const rest = new REST({ version: "10" }).setToken(token);

    console.log("🔄 [Commands] Registering slash commands...");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands.map((cmd) => cmd.toJSON()),
    });

    console.log(
      `✅ [Commands] Registered ${commands.length} slash commands globally`
    );
  } catch (error) {
    console.error("❌ [Commands] Failed to register commands:", error.message);
  }
}

// ═══════════════════════════════════════════
// /status Handler
// ═══════════════════════════════════════════

async function handleStatusCommand(interaction) {
  await interaction.deferReply();

  const checks = [
    {
      name: "🌐 Website",
      url: process.env.WEBSITE_URL || process.env.FRONTEND_URL,
    },
    {
      name: "⚙️ API",
      url: process.env.BACKEND_URL
        ? `${process.env.BACKEND_URL}/api/health`
        : null,
    },
    {
      name: "🔥 Firebase",
      url: `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID || "default"}/databases/(default)/documents`,
    },
    {
      name: "☁️ GCP",
      url: "https://cloud.google.com",
    },
  ];

  const results = [];

  for (const check of checks) {
    if (!check.url) {
      results.push({
        name: check.name,
        status: "⚪ Not configured",
        latency: "—",
      });
      continue;
    }

    try {
      const start = Date.now();
      const response = await axios.get(check.url, {
        timeout: 10000,
        validateStatus: () => true, // Accept any status code
      });
      const latency = Date.now() - start;

      const isUp = response.status >= 200 && response.status < 400;
      results.push({
        name: check.name,
        status: isUp ? "🟢 Online" : `🟡 HTTP ${response.status}`,
        latency: `${latency}ms`,
      });
    } catch (error) {
      results.push({
        name: check.name,
        status: "🔴 Offline",
        latency: error.code || error.message,
      });
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("📊 System Status")
    .setDescription("Real-time status of all connected services")
    .addFields(
      results.map((r) => ({
        name: r.name,
        value: `${r.status}\n⏱️ ${r.latency}`,
        inline: true,
      }))
    )
    .setColor(
      results.every((r) => r.status.includes("Online"))
        ? COLORS.SUCCESS
        : COLORS.WARNING
    )
    .setTimestamp()
    .setFooter({ text: "WeddingWeb AI" });

  await interaction.editReply({ embeds: [embed] });
}



// ═══════════════════════════════════════════
// Interaction Router
// ═══════════════════════════════════════════

/**
 * Route incoming interactions to the appropriate handler.
 * @param {Interaction} interaction
 */
async function handleInteraction(interaction) {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case "ticket":
        return await handleTicketCommand(interaction);
      case "status":
        return await handleStatusCommand(interaction);
      default:
        console.warn(
          `⚠️  [Commands] Unknown command: ${interaction.commandName}`
        );
    }
  }

  // Select menu (ticket type)
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_type_select") {
      const { handleTicketSelect } = require("./tickets");
      return await handleTicketSelect(interaction);
    }
  }

  // Button (ticket close)
  if (interaction.isButton()) {
    if (interaction.customId === "ticket_close") {
      const { handleTicketClose } = require("./tickets");
      return await handleTicketClose(interaction);
    }
  }
}

module.exports = {
  registerCommands,
  handleInteraction,
  commands,
};
