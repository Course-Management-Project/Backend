FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

RUN npm run build

RUN addgroup --gid 1001 nodejs \
    && adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" app

USER app

EXPOSE 3000
CMD ["npm", "start"]
