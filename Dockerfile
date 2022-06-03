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
RUN yarn
RUN ls && ls node_modules/@metacell/geppetto-meta-ui/
RUN ls && ls node_modules/@metacell/geppetto-meta-core/
COPY geppetto.js/geppetto-ui/src/3d-canvas/README.md node_modules/@metacell/geppetto-meta-ui/3d-canvas/
COPY geppetto.js/geppetto-ui/src/3d-canvas/Canvas.js node_modules/@metacell/geppetto-meta-ui/3d-canvas/
COPY geppetto.js/geppetto-core/src/Resources.js node_modules/@metacell/geppetto-meta-core
COPY geppetto.js/geppetto-ui/src/3d-canvas/showcase/assets node_modules/@metacell/geppetto-meta-ui/showcase/assets/
COPY geppetto.js/geppetto-ui/src/3d-canvas/showcase/examples/NRRDExample.js node_modules/@metacell/geppetto-meta-ui/3d-canvas/showcase/examples/
COPY geppetto.js/geppetto-ui/src/3d-canvas/threeDEngine/MeshFactory.js node_modules/@metacell/geppetto-meta-ui/3d-canvas/threeDEngine/

# COPY SOURCE CODE
COPY geppetto-showcase .

# BUILD
RUN npm run build

####################################################################

FROM nginx:alpine
COPY --from=build-stage /app/geppetto-showcase/dist/ /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY geppetto-showcase/nginx/nginx.conf /etc/nginx/conf.d
