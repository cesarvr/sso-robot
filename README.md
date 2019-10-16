# SSO Agent
This is a multipurpose robot to perform various task at the moment it supports: 

- Users lookup using OpenId authentication. 
    - ```sh
        node sso.js --url <RH-SSO-URL> <user> <password> <realm>
        node sso.js -url https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ JOHN.WHITE @d3vpw4812!!
       ```
     > It will decrypt the token and put it in a file inside the ``logs`` folder.
    
- Roles population. 