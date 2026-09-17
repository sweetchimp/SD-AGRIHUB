FROM node:18-bullseye

WORKDIR /app

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
