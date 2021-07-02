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

# Prepare geppetto-client/core/ui dependencies
RUN yarn global add yalc
WORKDIR /app/geppetto.js/geppetto-ui
# Only build src since we parse the src files to extract e.g. React props
RUN yarn && yarn build:src && yarn publish:yalc

WORKDIR /app/geppetto.js/geppetto-core
RUN yarn && yarn build && yarn publish:yalc

WORKDIR /app/geppetto.js/geppetto-client
RUN yalc add @metacell/geppetto-meta-ui
RUN yalc add @metacell/geppetto-meta-core
RUN yarn && yarn build && yarn publish:yalc

# INSTALL PACKAGES
WORKDIR /app/geppetto-showcase
RUN yalc add @metacell/geppetto-meta-ui
RUN yalc add @metacell/geppetto-meta-client
RUN yalc add @metacell/geppetto-meta-core
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
