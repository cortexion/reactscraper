cd my-app
local:
npm start

before heroku:
"start": "node server/server.js"
npm run build
git add .
git commit -m "test"
git push heroku master

local:
"start": "react-scripts start",
heroku:
"start": "node server/server.js"