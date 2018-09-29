FROM node:10

RUN npm install -g --unsafe-perm gulp node-sass eslint create-react-app
WORKDIR /app

EXPOSE 3000
EXPOSE 3001
CMD npm install && gulp dev
