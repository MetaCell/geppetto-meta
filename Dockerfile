FROM node:16-alpine AS build-stage

# NGINX PORT
EXPOSE 80

WORKDIR /app

# YARN REQUIRES GIT BINARY
RUN apk add git

# COPY PACKAGE MANAGEMENT FILES + DEPENDENCIES
COPY geppetto-showcase/package*.json geppetto-showcase/
COPY geppetto-showcase/yarn.lock geppetto-showcase/
COPY geppetto.js geppetto.js

# INSTALL PACKAGES
WORKDIR /app/geppetto-showcase
COPY geppetto.js/geppetto-ui/src @metacell/geppetto-meta-ui/
RUN ls @metacell/geppetto-meta-ui/
RUN yarn

# COPY SOURCE CODE
COPY geppetto-showcase .

# BUILD
RUN npm run build

####################################################################

FROM nginx:alpine
COPY --from=build-stage /app/geppetto-showcase/dist/ /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY geppetto-showcase/nginx/nginx.conf /etc/nginx/conf.d
