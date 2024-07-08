FROM buildkite/puppeteer:latest

ENV CHROME_BIN=/usr/bin/chromium-browser
ARG DEBIAN_FRONTEND=noninteractive

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .
	
CMD ["npm", "run", "puppeteer_test"]