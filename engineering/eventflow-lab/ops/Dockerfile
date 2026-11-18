FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
USER node
ENV PORT=4000 DB_FILE=/data/events.sqlite
EXPOSE 4000
CMD ["node", "server/api.cjs"]
