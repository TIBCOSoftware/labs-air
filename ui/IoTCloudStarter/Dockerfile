# base image
FROM node:12.11.0

# set working directory
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# add app
COPY . /app

# start app
CMD npm run ng-high-memory-serve-us