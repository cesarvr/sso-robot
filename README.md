# SSO Agent
This is a multi-purpose robot to perform various task, it comes handy to automate some task against Red Hat Single Sign-On:

### Get

You can get different Keycloak resources by doing: 

```sh
node sso.js -get <resource> <url> <realm-if-needed>
```

Example:

```sh
node sso.js -get client https://my-keycloak-server my-client

{
  clientId: 'my-client-1',
  rootUrl: '',
  adminUrl: '',
  surrogateAuthRequired: false,
  enabled: true,
}
```

### Searching

Some cases if you don't remember the name of a particular service you can do a search: 

```sh
node sso.js -find <resource> <url> --key=value
```

Example: 

```sh
node sso.js -find client https://my-keycloak-server --clientId=my-client

{
  clientId: 'my-client-1',
  rootUrl: '',
  adminUrl: '',
  surrogateAuthRequired: false,
  enabled: true,
}
```
### Filtering

If you want to pull resources that follow a pattern you can: 

```sh
node sso.js -filter <resource> <url> --key=value
```

Example: 

```sh
node sso.js -filter client https://my-keycloak-server --clientId=my-client

[
    {
      clientId: 'my-client-1',
      rootUrl: '',
      adminUrl: '',
      surrogateAuthRequired: false,
      enabled: true,
    },
    {
      clientId: 'my-client-2',
      rootUrl: '',
      adminUrl: '',
      surrogateAuthRequired: false,
      enabled: true,
    }
]

```


### Migrating Components 

The majority of calls defined above returns a plain ``JSON object``, this is very useful to orchestrate synchronization between different RHSSO environments. 

```sh 
# Import
node sso.js -find storage https://my-keycloak-dev demorealm --name="my-user-federation-spi" > my-spi.json

# Now we can export it to another environment
node sso.js -post storage https://my-keycloak-uat my-spi.json demorealm
```

### Miscellaneous

**Clear/Clean** Remove the test files from ``logs/*``


## Customization

The command line tool works like this, it takes:

```sh
    node sso.js -<command> arg1 arg2 arg3
```

And the class ```CMD``` basically inject the get the command order ``-command`` and call the function mapped to that field: 

```js
 new CMD({
      <command>: (arg1, arg2, arg3) => YourOwnModule(...arg).DoSomething()
 }).run()
```


### New Parameters 

Also there is the possibility to add parameters like this ones: 

```sh
node sso.js -get resource --name=my_resource --realm=my_realm

```

This makes things easier to remember, you can collect then the values with this: 

```js
 let argss = read_params( process.argv ) // {name: 'my_resource', realm='my_realm'}
```

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


