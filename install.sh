echo "======= Adding Roles  =======" &&
node sso.js install roles --name=deployer-bot --token=$1 --project=$2 &&

echo "======= Deploying =======" &&
node sso.js install robot --name=deployer-bot --token=$1 --project=$2 &&
node sso.js install build --name=deployer-bot --token=$1 --project=$2