# SSO Agent
This is a multipurpose robot to perform various task at the moment it supports: 


## Commands

- **Users lookup** Logins a particular user using the OpenId protocol. 

```sh
    node sso.js -url <RH-SSO-URL> <user> <password> <realm>
     
    node sso.js -url https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ JOHN.WHITE @d3vpw4812!!
```

    > It will decrypt the token and put it in a file inside the ``logs/test_result.json`` folder, then we can use this file to validate the user.
    
- **Roles population** This actions allows you to create roles in a particular realm or all realms, this can be use to automate deployments of RHSSO in other namespaces. 

```sh
    node sso.js -config <RH-SSO-URL> <user> <password> <realm>
     
    node sso.js -config https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ JOHN.WHITE @d3vpw4812!!
```

### Miscellaneous

- **Clear/Clean** Remove the test files from ``logs/*``


## Adding More Commands 

The robot works this way it takes: 

```sh
    node sso.js -<command> arg1 arg2 arg3 
```


You defined the command as follow, you need to go to the ```sso.js``` and look for add your function to the constructor: 


```js
 new CMD({
      <command>: (arg1, arg2, arg3) => YourOwnModule(...arg).DoSomething() 
      
 }).run()
```




