oc new-build -n cicd --name sso-bot --strategy=docker --binary=true mhart/alpine-node
oc create dc sso-bot --image=docker-registry.default.svc:5000/cicd/sso-bot
oc set triggers dc/sso-bot --from-image=is/sso-bot:latest -c default-container
