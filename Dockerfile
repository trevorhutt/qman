FROM node:13.5 as dev
ENV NODE_ENV development
WORKDIR /app
EXPOSE 4000
COPY package.json /app
RUN apt update && apt install dnsutils -y
RUN apt install nano -y
RUN npm install
COPY . .
CMD ["node", "server.js"]

FROM node:13.5 as runtime
ENV NODE_ENV production
WORKDIR /app
EXPOSE 4000
COPY package.json /app
RUN apt update && apt install dnsutils -y
RUN apt install nano -y
RUN npm install
COPY . /app
CMD ["node", "server.js"]