FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma query engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy and install backend deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy and install frontend deps
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend
RUN cd frontend && npm run build

EXPOSE 8080
CMD ["node", "src/server.js"]
