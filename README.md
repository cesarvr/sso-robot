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

First you need to install the dependencies with:

```
npm install

```
Then to install this agent in Openshift you need a token and
```
sh install.sh ewwN7vVv5g5Y... test test
```

## Installation

This bot is designed to deploy itself into an Openshift but first you need to do some manual configuration, first you need to setup an environment variable pointing to your *Openshift API server*:

- Windows:

```sh
  set OKD_SERVER=https://my-openshift:443
```

- Linux:

```sh
  export OKD_SERVER=https://my-openshift:443
```

To proceed to the installation you need to give it access to the cluster by providing a token, to get the token:

```sh
  oc whoami -t
  #gdFfxkC7DEsBOfg...
```

Now you can install it like this:

```sh
sh install.sh gdFfxkC7DEsBOfg... project project-target
```

The first parameter is the token, the second parameter is the project:

  - **project:** Is the namespace where you want to deploy the bot, just make sure that the ``token`` has privilege to perform the require actions (can create) in that namespace/project.

  - **project-target:** Basically configure the bot to have permissions in a particular namespace.

### Example

Let say we want to deploy this robot into the ``cicd`` namespace and we want to deploy/control RHSSO's instances on ``sso-development`` namespace, to do that we install it the following way:

```sh
  sh install.sh gdFfxkC7DEsBOfg... cicd sso-development
```


#### What It Does

Basically that ```install.sh``` script do the following things behind the scene:

First [it creates some roles](https://github.com/cesarvr/sso-robot/blob/master/templates/ocp/robot-role.yml) that will allow the robot to perform the required activities such as deployment, observing, etc.   

```sh
node sso.js install roles --name=deployer-bot --token=$1 --project=$2 --target=$3 &&
```

Then it will build an image and deploy it into ``cicd`` namespace. 

```sh
node sso.js install robot --name=deployer-bot --token=$1 --project=$2 --target=$3 &&

node sso.js install build --name=deployer-bot --token=$1 --project=$2 --target=$3
```



### Local

To use it locally you just need to setup an environment variable in your command-line specifying the Openshift server REST API like this:

And provide the token:

```sh
 node sso.js deploy create --name=ssso73 --token=my-token --project=hello
```

> When running in a Pod is not necessary to pass the token parameter, the bot takes the container token.

# RHSSO Resources

This is Node.js extendable command line to automate Red Hat Single Sign-On (RHSSO) deployment configuration, image streams, build configuration, realms creation, clients, authentication (handy to test custom [Keycloak Providers](https://www.keycloak.org/docs/6.0/server_development/#_providers)), etc.

## Keycloak Actions

You can pull/post/find/filter the following resources from Keycloak/RHSSO:

- Clients & Clients Secrets
- Federation Plugins
- Realms

### Get

To get a client for example:

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
node sso.js find client --project=sso-dev --url=https://my-rhsso-server --realm=demorealm --query=clientId=webapp1&enabled=true &&

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
node sso.js -filter client https://my-rhsso-server --clientId=my-client

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
