set -e

cd client
NODE_ENV=development npm install
npm run build
cd ..
NODE_ENV=development npm install
NODE_ENV=development node ace build --production