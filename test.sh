#!/bin/bash
clear

echo "=======Testing OKD=======" &&
node sso.js test sso-dev --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev &&
echo "=======Creating BuildConfig/ImageStream=======" &&
node sso.js builder --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=hello --name=sso73 &&
echo "======Get One Client=======" &&
node sso.js get client --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm &&
echo "======Finding One Client=======" &&
node sso.js find client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=clientId=webapp1 &&
echo "==== Filtering by -> enabled -> true =========" &&
node sso.js filter client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=enabled=true &&
echo "==== Filtering by -> notBefore=========" &&
node sso.js filter client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=notBefore=0  &&
echo "====POST Keycloak Clients=======" &&
node sso.js post client --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --from-file=./templates/rhsso/client.json &&
echo "=== Login To Dev DB via OpenId ===" &&
node sso.js openid --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --client=webapp1 --username=JAMES.WHITE --password=@d3vpw4812!! &&
echo "=== Login To Dev UAT via OpenId ===" &&
node sso.js openid --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=UAT --client=webapp1 --username=JAMES.WHITE --password=@u@tpw369!! 

echo "=== Testing Error messages ===" &&
node sso.js 
node sso.js test 