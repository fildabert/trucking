FROM node:14

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package-lock.json /usr/src/app/package-lock.json
COPY package.json /usr/src/app/package.json

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . /usr/src/app/
EXPOSE 3000

RUN npm run build
# RUN npm run start
# CMD [ "npm", "run", "dev" ]