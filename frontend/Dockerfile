FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG API_BASE_URL=http://api:3001
ENV API_BASE_URL=$API_BASE_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]