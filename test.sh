#!/bin/bash
clear

#echo "=======Testing OKD=======" &&
#node sso.js test sso-dev --token=my-token --project=sso-dev &&
#
#echo "=======Creating BuildConfig/ImageStream=======" &&
#node sso.js builder --token=my-token --project=hello --name=sso73 &&
#
#echo "======Get One Client=======" &&
#node sso.js get client --project=sso-dev --url=https://my-sso --realm=demorealm &&
#
#echo "======Finding One Client=======" &&
#node sso.js find client --project=sso-dev --url=https://my-sso --realm=demorealm --query=clientId=webapp1,enabled=true
#
#echo "==== Filtering by -> enabled -> true =========" &&
#node sso.js filter client --project=sso-dev --url=https://my-sso --realm=demorealm --query=enabled=true &&
#
#echo "==== Filtering by -> notBefore=========" &&
#node sso.js filter client --project=sso-dev --url=https://my-sso --realm=demorealm --query=notBefore=0  &&
#
#echo "====POST Keycloak Clients=======" &&
#node sso.js post client --url=https://my-sso --realm=demorealm --from-file=./templates/rhsso/client.json &&
#
#echo "=== Login To Dev DB via OpenId ===" &&
#node sso.js openid --url=https://my-sso --realm=demorealm --client=webapp1 --username=JAMES --password=mmmmmDDDD &&
#
#echo "=== Login To Dev UAT via OpenId ===" &&
#node sso.js openid --url=https://my-sso --realm=UAT --client=webapp1 --username=JAMES --password=nndddsaddsad &&
#
#echo "======= Testing Deployment [create] =======" &&
#node sso.js deploy create --name=ssso73 --token=my-token --project=hello &&


#echo "======= Testing Image =======" &&
#node sso.js image create --name=ssso73 --token=my-token --project=hello &&

echo "======= Testing Deployment [roles] =======" &&
node sso.js install roles --name=deployer-bot --image=sso73 --token=my-token --project=hello --target=hello &&

echo "======= Testing Install [only robot] =======" &&
node sso.js install robot --name=deployer-bot --token=my-token --project=hello --target=hello &&

echo "======= Testing Install [only build] =======" &&
node sso.js install build --name=deployer-bot --token=my-token --project=hello --target=hello

#echo "=== Testing Error messages ===" &&
#node sso.js
#node sso.js test
