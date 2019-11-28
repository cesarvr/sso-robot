set OKD_SERVER=https://console.rhos.agriculture.gov.ie 
oc start-build -n cicd bc/sso-bot --from-file=. --follow
