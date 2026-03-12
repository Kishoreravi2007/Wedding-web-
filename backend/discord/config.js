/**
 * Discord Bot Configuration
 * ─────────────────────────────────────────────
 * Centralized settings for WeddingWeb AI bot.
 * Use environment variables for deployment-specific values.
 */

const CONFIG = {
  BOT_NAME: "WeddingWeb AI",
  PRESENCE: {
    ACTIVITY: "your server | WeddingWeb AI",
    TYPE: "Watching", // Watching, Playing, Listening, Streaming, Competing
    STATUS: "online", // online, idle, dnd, invisible
  },
  URLS: {
    WEBSITE: process.env.WEBSITE_URL || "https://weddingweb.co.in",
    API_HEALTH: `${process.env.BACKEND_URL || "http://localhost:5002"}/api/health`,
  },
  AI: {
    MODEL: "gpt-3.5-turbo",
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7,
    SYSTEM_PROMPT: "You are a helpful Discord bot assistant for WeddingWeb. Use the following knowledge base to answer questions accurately. If the answer isn't in the knowledge base, answer generally as a WeddingWeb representative. Keep responses concise (under 2000 characters) and formatted for Discord.",
  },
};

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

const CHANNELS = {
  GENERAL: "general",
  ANNOUNCEMENTS: "announcements",
  RULES: "rules",
  SERVER_LOGS: "server-logs",
  JOIN_LOGS: "join-logs",
  ERROR_LOGS: "error-logs",
  TICKET_LOGS: "ticket-logs",
  OPEN_TICKET: "open-ticket",
};

const CATEGORIES = {
  INFO: "INFO",
  COMMUNITY: "COMMUNITY",
  SUPPORT: "SUPPORT",
  TICKETS: "TICKETS",
  BOT: "BOT",
  DEVELOPERS: "DEVELOPERS",
  ADMIN: "ADMIN",
  LOGS: "LOGS",
};

const SERVER_STRUCTURE = {
  [CATEGORIES.INFO]: ["announcements", "rules", "about-project", "website-link", "updates"],
  [CATEGORIES.COMMUNITY]: ["general", "help", "feedback", "feature-requests"],
  [CATEGORIES.SUPPORT]: ["support-chat", "bug-report", "api-issues"],
  [CATEGORIES.TICKETS]: ["open-ticket", "ticket-logs"],
  [CATEGORIES.BOT]: ["bot-commands", "ai-chat", "status-check", "bot-logs"],
  [CATEGORIES.DEVELOPERS]: ["dev-chat", "backend", "frontend", "database", "errors"],
  [CATEGORIES.ADMIN]: ["admin-only", "deployments", "mod-chat"],
  [CATEGORIES.LOGS]: ["server-logs", "join-logs", "error-logs"],
};

const ROLES = [
  { name: "Admin",     color: 0xe74c3c, hoist: true, permissions: ["Administrator"] },
  { name: "Moderator", color: 0xe67e22, hoist: true, permissions: ["KickMembers", "BanMembers", "ManageMessages", "MuteMembers"] },
  { name: "Developer", color: 0x3498db, hoist: true, permissions: ["ManageChannels", "ManageMessages"] },
  { name: "Support",   color: 0x2ecc71, hoist: true, permissions: ["ManageMessages"] },
  { name: "User",      color: 0x95a5a6, hoist: false, permissions: ["SendMessages", "ReadMessageHistory", "ViewChannel"] },
  { name: "Bot",       color: 0x9b59b6, hoist: true, permissions: ["SendMessages", "ManageMessages", "EmbedLinks", "AttachFiles", "ReadMessageHistory", "ViewChannel"] },
];

const TICKET_TYPES = [
  { label: "Support",  value: "support",  emoji: "💬", description: "General support request" },
  { label: "Bug",      value: "bug",      emoji: "🐛", description: "Report a bug or issue" },
  { label: "Payment",  value: "payment",  emoji: "💳", description: "Payment or billing issue" },
  { label: "API",      value: "api",      emoji: "🔌", description: "API-related question" },
  { label: "Other",    value: "other",    emoji: "📝", description: "Other inquiry" },
];

const MESSAGES = {
  WELCOME: {
    TITLE: "🎉 Welcome to the Server!",
    DESCRIPTION: "Hey <@%USER_ID%>, welcome to **%GUILD_NAME%**!\n\nWe're glad to have you here. Here are some tips to get started:",
    TIPS: [
      "📢 Check out <#%ANN_ID%> for the latest news",
      "📜 Read the <#%RULES_ID%> to stay on track",
      "💬 Say hi in this channel!",
      "🎫 Need help? Use `/ticket` to open a support ticket"
    ],
    FOOTER: "%BOT_NAME% — Member #%COUNT%"
  },
  MODERATION: {
    WARN_TITLE: "⚠️ Warning — Inappropriate Language",
    WARN_DESC: "Your message in **%GUILD_NAME%** was removed for containing inappropriate language.\n\n**Strike %STRIKE%/2** — One more violation will result in a permanent ban.",
    WARN_CHANNEL: "<@%USER_ID%> — ⚠️ Watch your language! (Strike %STRIKE%/2)",
    BAN_TITLE: "🔨 Banned — Repeated Violations",
    BAN_DESC: "You have been permanently banned from **%GUILD_NAME%** for repeated use of inappropriate language.\n\n**Strike %STRIKE%** — This ban is permanent.",
    BAN_REASON: "Foul language — Strike %STRIKE%+",
    LOG_TITLE: "🚨 Auto-Moderation",
    LOG_ACTION_WARN: "⚠️ Warning issued",
    LOG_ACTION_BAN: "🔨 Permanently banned"
  },
  TICKETS: {
    OPEN_TITLE: "🎫 Open a Ticket",
    OPEN_DESC: "Select the type of issue you need help with from the dropdown below.",
    SELECT_PLACEHOLDER: "Select ticket type...",
    CHANNEL_NAME: "ticket-%USER_NAME%-%NUMBER%",
    REASON_OPEN: "Ticket opened by %TAG%",
    WELCOME_TITLE: "%EMOJI% Ticket #%NUMBER% — %LABEL%",
    WELCOME_DESC: "Hello <@%USER_ID%>\n\nYour **%LABEL%** ticket has been created.\nPlease describe your issue in detail and a team member will assist you shortly.",
    PRIORITY_LABEL: "Priority",
    PRIORITY_VALUE: "Normal",
    STATUS_LABEL: "Status",
    STATUS_OPEN: "🟢 Open",
    CLOSE_BUTTON: "Close Ticket",
    REPLY_CREATED: "✅ Your ticket has been created: <#%CHANNEL_ID%>",
    LOG_OPEN_TITLE: "Ticket Opened",
    LOG_CLOSE_TITLE: "Ticket Closed",
    LOG_CLOSE_DESC: "**Channel:** #%CHANNEL_NAME%\n**Closed by:** <@%USER_ID%>\n**Messages:** %COUNT%",
    TRANSCRIPT_TITLE: "📋 Ticket Transcript — #%CHANNEL_NAME%",
    CLOSING_NOTICE: "🔒 This ticket will be closed in 5 seconds..."
  },
  STATUS: {
    TITLE: "📊 System Status",
    DESC: "Real-time status of all connected services",
    NOT_CONFIGURED: "⚪ Not configured",
    ONLINE: "🟢 Online",
    OFFLINE: "🔴 Offline"
  },
  SETUP: {
    TITLE: "✅ Server Auto-Setup Complete!",
    DESC: "Your server has been fully configured by the bot.",
    LOG_TITLE: "Server Setup Complete",
    LOG_DESC: "Categories: %CAT% new | Channels: %CHAN% new | Skipped: %SKIP%"
  },
  LOGS: {
    JOIN_TITLE: "👋 Member Joined",
    JOIN_DESC: "%TAG% joined the server.",
    LEAVE_TITLE: "🚪 Member Left",
    LEAVE_DESC: "%TAG% left the server.",
    ERROR_FOOTER: "WeddingWeb AI Error Log"
  }
};

module.exports = {
  CONFIG,
  COLORS,
  CHANNELS,
  CATEGORIES,
  SERVER_STRUCTURE,
  ROLES,
  TICKET_TYPES,
  MESSAGES,
};

