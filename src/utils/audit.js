const prisma = require("../config/database");

async function logAction(userId, farmId, action, entity, entityId, details = null, ipAddress = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        farmId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
}

module.exports = { logAction };
