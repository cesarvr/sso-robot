oc new-build -n cicd --name sso-bot --strategy=docker --binary=true mhart/alpine-node
oc create -f build\agent.yml -n cicd -f
