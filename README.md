# SSO Agent
This is a multi-purpose robot to perform various task, it comes handy to automate some task against Red Hat Single Sign-On:

**Users lookup** Logins a particular user using the OpenId protocol.

```sh
    node sso.js -url <RH-SSO-URL> <user> <password> <realm>

    node sso.js -url https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ JOHN.WHITE @d3vpw4812!!
```

   > It will decrypt the token and put it in a file inside the ``logs/test_result.json`` folder, then we can use this file to validate the user.



<br>    

**Roles population** This actions allows you to create roles in a particular realm or all realms, this can be use to automate deployments of RHSSO in other namespaces.

```sh
    node sso.js -config <RH-SSO-URL> <admin-user> <admin-password> <realm>

    node sso.js -config https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ admin 123456 my_realm

    ## or
    node sso.js -roles https://secure-sso-sso-dev.apps.rhos.agriculture.gov.ie/ admin 123456 my_realm
```
<br>  

### Miscellaneous

**Clear/Clean** Remove the test files from ``logs/*``


<br>  

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
<<<<<<< HEAD
=======



## Deploying The Bot

This project includes an script to create the BuildConfiguration and the Deployment:

```sh
   sh ./build/create.sh    
```

Next you can locate the pod using ``oc get pod`` and locate a pod that start with ``sso-bot-*``: 

```sh
    oc get pod 

    # NAME               READY     STATUS       RESTARTS   AGE
    # sso-bot-1-hgg2l    1/1       Running      0          9m
```

Remote command execution: 

```sh
    oc exec sso-bot-1-hgg2l -- node sso.js -url https://sso-uat user xxyy my_realm

    #...
    #...
```


## Adding Changes Bot

Once you tested your changes you need to deploy it like this: 

```sh
sh ./build/build.sh
```

This scripts deploy a new version and automatically deploy the new image into a new pod, now you just need to again locate the pod: 

```sh
    oc exec sso-bot-1-hgg2l -- node sso.js -my_new_command arg1 arg2

    #...
    #...
```



>>>>>>> 1aa67cad4057009c2e102dbebd741c6ee1daa288
