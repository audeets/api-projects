FROM node:20.10-alpine3.19
COPY . /usr/app
EXPOSE 5443 5080
WORKDIR /usr/app
CMD ["npm", "run", "start"]
