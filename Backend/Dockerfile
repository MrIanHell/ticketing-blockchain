FROM node:10.15.3

WORKDIR /Token
ADD Token .

WORKDIR /contentBackendService
ADD . .

RUN npm install
RUN npm install -g nodemon

EXPOSE 5000

CMD nodemon server.js

# docker build --tag content-backend .
# docker run -d --name cb1 -p 5000:5000 content-backend