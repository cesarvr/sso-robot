#!/bin/bash
clear

#echo "=======Testing OKD=======" &&
#node sso.js test sso-dev --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=sso-dev &&
#
#echo "=======Creating BuildConfig/ImageStream=======" &&
#node sso.js builder --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello --name=sso73 &&
#
#echo "======Get One Client=======" &&
#node sso.js get client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm &&
#
#echo "======Finding One Client=======" &&
#node sso.js find client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=clientId=webapp1,enabled=true
#
#echo "==== Filtering by -> enabled -> true =========" &&
#node sso.js filter client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=enabled=true &&
#
#echo "==== Filtering by -> notBefore=========" &&
#node sso.js filter client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=notBefore=0  &&
#
#echo "====POST Keycloak Clients=======" &&
#node sso.js post client --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --from-file=./templates/rhsso/client.json &&
#
#echo "=== Login To Dev DB via OpenId ===" &&
#node sso.js openid --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --client=webapp1 --username=JAMES.WHITE --password=@d3vpw4812!! &&
#
#echo "=== Login To Dev UAT via OpenId ===" &&
#node sso.js openid --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=UAT --client=webapp1 --username=JAMES.WHITE --password=@u@tpw369!! &&
#
#echo "======= Testing Deployment [create] =======" &&
#node sso.js deploy create --name=ssso73 --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello &&


#echo "======= Testing Image =======" &&
#node sso.js image create --name=ssso73 --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello &&

echo "======= Testing Deployment [roles] =======" &&
node sso.js install roles --name=deployer-bot --image=sso73 --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello --target=hello &&

echo "======= Testing Install [only robot] =======" &&
node sso.js install robot --name=deployer-bot --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello --target=hello &&

echo "======= Testing Install [only build] =======" &&
node sso.js install build --name=deployer-bot --token=FxkC7DEs2OsBmP0Az1bTJs-cll4BDz2RWZY6wyWLOfg --project=hello --target=hello


#echo "=== Testing Error messages ===" &&
#node sso.js 
#node sso.js test 