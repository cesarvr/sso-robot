#!/bin/bash

clear

#node sso.js test sso-dev --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev &&
#echo "==========================" &&
#node sso.js builder --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=hello --name=sso73 &&
#echo "==========================" &&
#node sso.js test sso-dev --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev &&
#echo "==========================" &&
node sso.js get client --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm &&
echo "==========================" &&
node sso.js find client --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=clientId=webapp1 &&
echo "==========================" &&
node sso.js filter client --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=enabled=true
echo "==========================" &&
node sso.js filter client --token=NWOvLHXor8tfEn7eoaXmAmQtj6mSLvdJ47jEq_dfdrI --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=notBefore=0
