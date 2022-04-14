FROM node:10
WORKDIR usr/src/app

# Install Packages
COPY package*.json ./
RUN npm install

# Specify Production environment
ENV NODE_ENV=production

# Copy Files Over
COPY . .

# Build Package
RUN npm run build

# Serve Package
CMD ["npm", "start"]