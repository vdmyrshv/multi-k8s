##### BUILD PHASE #####

# specify a base image
# FROM node:alpine as builder - you can tag a build with a name but AWS has trouble with named builds so it cannot be used here
FROM node:alpine

# specify a working directory in the the container
WORKDIR /app

# copy package.json file over first before npm install, to only trigger cache update if package.json is updated
# otherwise anytime a file changes npm install will re-run
COPY ./package.json ./

# install dependencies in the container
RUN npm install

# copy the rest of the files over from the current context to the working directory in the container
COPY . .

# run npm run build to get output of the build folder with all of the static files
# the end result of this will be all of the output on /app/build
RUN npm run build

##### RUN PHASE #####
# to specify the start of a second phase, all you have to do is write FROM again
# simply by putting a second FROM statement, docker knows that the previous block is complete
FROM nginx
# exposes the port that nginx will be running on
# this is specifically for AWS Elastic Beanstalk, as it specifically searches for the port
# this port is listening on 3000, not 80 because this instance of nginx is only to house react prod build
EXPOSE 3000
# copy our dfault.conf file from current working directory to the container
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# now we copy over files from the previous phase
# using the --from flag to specify which phase
# we can use the alias as mentioned in the copy from the first FROM statement, 
# but with aws you cannot use aliases, so we can use the index of the build, so it's FROM statement index 0
# then specify that we want stuff from the build folder after running npm runb build and copy it to the nginx folder
# the TO folder /usr/share/nginx/html is taken directly from the docker hub documentation
# anything in that folder will be automatically served up
COPY --from=0 /app/build /usr/share/nginx/html

# we don't need a CMD command because the default command for nginx is to start up (as per the docs)
