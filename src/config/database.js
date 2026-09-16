const { PrismaClient } = require("@prisma/client");

let client;

const handler = {
  get(_, prop) {
    if (!client) {
      client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
};

module.exports = new Proxy({}, handler);
