FROM node:24-alpine

WORKDIR /app

COPY --chown=node:node app.js package.json ./

ARG IMAGE_TAG=unknown
ENV IMAGE_TAG=${IMAGE_TAG} \
    NODE_ENV=production \
    PORT=8000

USER node
EXPOSE 8000

CMD ["node", "app.js"]
