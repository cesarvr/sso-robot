# SSO-Robot

Just a Openshift (operator like) writen in Node.js to automate Red Hat Single Sign-On deployments and orchestrate configuration/migration of resources.

I wrote this to simplify the process of writing plugins in SSO, with this you *operator* you should be able to write your plugin locally and automate its deployment into a RHSSO instance running on OpenShift. 

You can orchestrate actions like: 

- Deployment of Red Hat Single Sign-On (RHSSO). (Ephemeral or MySQL backed) 
- SPI configuration like Federation/Storage plugins. 
- OpenID authentication using (Direct Grant style), so you can test your plugin. 
- Automate the creation of clients and realms. 
- It does BuildConfig/ImageStream creation for custom RRHSSO image creation. 
- And is easy to extend. 

## Runtimes 

This bot is designed to deploy itself into an Openshift namespace of your choice, but if you want to use it locally you also can, you just need to setup an envrionment variable in your commandline specifying the Openshift server REST API like this: 

Windows: 

```sh
  set OKD_SERVER=https://my-openshift:443
```

Linux: 

```sh
  export OKD_SERVER=https://my-openshift:443
```

And now for example if you want to deploy RHSSO you can do: 

```sh
 node sso.js deploy create --name=ssso73 --token=my-token --project=hello
```

# RHSSO Resources

This is Node.js extendable command line to automate Red Hat Single Sign-On (RHSSO) deployment configuration, image streams, build configuration, realms creation, clients, authentication (handy to test custom [Keycloak Providers](https://www.keycloak.org/docs/6.0/server_development/#_providers)), etc. 



## Keycloak Actions 

You can pull/post/find/filter the following resources from Keycloak/RHSSO:

- Clients & Clients Secrets
- Federation Plugins
- Realms

### Get

```sh
node sso.js get client --project=sso-dev --url=<https://my-keycloak-instance> --realm=my-realm
[{
  clientId: 'my-client-1',
  rootUrl: '',
  adminUrl: '',
  surrogateAuthRequired: false,
  enabled: true,
}]
```

### Searching

Some cases if you don't remember the name of a particular service you can do a search: 

```sh
node sso.js find client --project=sso-dev --url=https://ss073-sso-dev.apps.rhos.agriculture.gov.ie --realm=demorealm --query=clientId=webapp1&enabled=true &&

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

## OpenShift

Part of its functionality is to also automate the deployment of RHSSO/Keycloak instances in OpenShift, it work best when deployed into a Pod because you can create a [service account](https://docs.openshift.com/container-platform/3.6/dev_guide/service_accounts.html) to have a better control of what namespace you can deploy RHSSO. 



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


