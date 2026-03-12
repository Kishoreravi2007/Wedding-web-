const { EmbedBuilder } = require("discord.js");
const { logServerEvent } = require("./logger");
const { ROLES: ROLE_DEFINITIONS } = require("./config");

/**
 * Create all required roles in a guild. Skips if role already exists.
 * @param {Guild} guild
 * @returns {object} Map of role name → Role object
 */
async function setupRoles(guild) {
  console.log(`🎭 [Roles] Setting up roles for ${guild.name}...`);
  const createdRoles = {};

  for (const def of ROLE_DEFINITIONS) {
    try {
      // Check if role exists
      const existing = guild.roles.cache.find((r) => r.name === def.name);
      if (existing) {
        console.log(`   ✅ Role "${def.name}" already exists`);
        createdRoles[def.name] = existing;
        continue;
      }

      // Build permissions bigint
      const { PermissionsBitField } = require("discord.js");
      let permsBits = new PermissionsBitField();
      for (const perm of def.permissions) {
        permsBits = permsBits.add(PermissionsBitField.Flags[perm]);
      }

      const role = await guild.roles.create({
        name: def.name,
        color: def.color,
        hoist: def.hoist,
        permissions: permsBits,
        reason: "Auto-setup by bot",
      });

      console.log(`   🆕 Created role "${def.name}"`);
      createdRoles[def.name] = role;
    } catch (error) {
      console.error(`   ❌ Failed to create role "${def.name}":`, error.message);
    }
  }

  await logServerEvent(
    guild,
    "Roles Setup Complete",
    `Created/verified ${ROLE_DEFINITIONS.length} roles: ${ROLE_DEFINITIONS.map((r) => r.name).join(", ")}`
  );

  return createdRoles;
}

/**
 * Auto-assign the "User" role to a new member.
 * @param {GuildMember} member
 */
async function autoAssignUser(member) {
  try {
    const userRole = member.guild.roles.cache.find((r) => r.name === "User");
    if (!userRole) {
      console.warn(`⚠️  [Roles] "User" role not found in ${member.guild.name}`);
      return;
    }

    await member.roles.add(userRole, "Auto-assigned on join");
    console.log(`🎭 [Roles] Assigned "User" role to ${member.user.tag}`);
  } catch (error) {
    console.error(
      `❌ [Roles] Failed to assign role to ${member.user.tag}:`,
      error.message
    );
  }
}

module.exports = { setupRoles, autoAssignUser, ROLE_DEFINITIONS };
