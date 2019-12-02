oc new-project cicd 
oc new-build -n cicd --name=sso-robot --strategy=docker --binary=true 
oc new-app -n cicd --image-stream=sso-robot --name=sso-robot
