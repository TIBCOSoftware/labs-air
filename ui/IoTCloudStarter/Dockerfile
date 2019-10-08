# base image
FROM node:12.11.0

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
#COPY package.json /app/package.json
#RUN mkdir /libs

#COPY ./libs /libs

#RUN npm install /libs/spotfire-wrapper-0.4.2.tgz
#RUN npm install
#RUN npm install -g @angular/cli@8.3.8

# add app
COPY . /app

# start app
CMD npm run serve_us