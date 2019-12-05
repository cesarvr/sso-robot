oc new-build -n $1 --name=sso-bot --strategy=docker --binary=true 
oc start-build -n $1 bc/sso-bot --from-file=. --follow
oc new-app -n $1 --image-stream=sso-bot --name=sso-bot
