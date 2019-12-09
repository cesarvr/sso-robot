# SSO-Robot

Just a Openshift (operator like) written in Node.js to automate Red Hat Single Sign-On deployments and manage its resources.

![](https://github.com/cesarvr/sso-robot/blob/master/img/how-to-use.png?raw=true)

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

## Example

Let say we want to deploy this robot into the ``cicd`` namespace and we want to deploy/control RHSSO's instances on ``sso-dev`` namespace, to do that we install it the following way:

```sh
  sh install.sh gdFfxkC7DEsBOfg... cicd sso-dev
```



### What Does It Do

Basically that ```install.sh``` script do the following things:

First [it creates some roles](https://github.com/cesarvr/sso-robot/blob/master/templates/ocp/robot-role.yml) that will allow the robot to perform the required activities such as deployment, observing, etc. On the ``sso-dev`` namespace.    

```sh
node sso.js install roles --name=deployer-bot --token=$1 --project=$2 --target=$3 &&
```

Then it will build an image and deploy it into ``cicd`` namespace.

```sh
node sso.js install robot --name=deployer-bot --token=$1 --project=$2 --target=$3 &&

node sso.js install build --name=deployer-bot --token=$1 --project=$2 --target=$3
```

### Local

You can also use it locally the only difference is that you will need to use your token for certain operations that involved calling the Openshift REST API:

For example:

```sh
 node sso.js deploy create --name=sso73 --token=my-token --project=hello
```

> When running in a Pod is not necessary to pass the token parameter, the bot takes the container token.

## Deploying/Building

Once the **sso-agent** is successfully deployed you will need to locate the pod, let say its called:

``sso-agent-xyz``

By following the example above we can now deploy RHSSO in the ``sso-dev`` namespace:

```sh
oc exec -n sso-dev sso-agent-xyz -- node sso.js deploy create --name=sso73  --project=hello
```

## Managing RHSSO/Keycloak Resources

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

## What Can I Do With This ?

### Automating The Deployment Of RHSSO

Let's write a simple example where we want to automatically spin up a RHSSO instance (called ``sso73``) and we are going to add one realm called ``Demo`` and one a custom client called ``demo-1`` on the project ``sso-dev``.

```sh
  # First we create the project...
  oc new-project sso-dev

  # Create the RHSSO instance...
  node sso.js deploy create --name=sso73 --token=my-token --project=hello
```

This will take a while depending on the machines and other factors, once the deployment is completed you can create the realm and client with:

First the realm:

```sh
  node sso.js post realm --url=https://my-sso --from-file=realm.json
```
The ``realm.json`` should look something like this:

```json
{
	"id":"demo",
	"realm":"demo",
	"displayName": "Demo",
	"displayNameHtml": "Demo",
	"enabled": true
}
```

Next we can create the client that belong to the ``demo`` realm:

```sh
node sso.js post client --url=https://my-sso --realm=demo --from-file=client.json
```

Here is a quick look to ``client.json`` content:

```json
  {
    "clientId": "demo-1",
    "surrogateAuthRequired": false,
    "enabled": true,
    "clientAuthenticatorType": "client-secret"
  }
```



### Migrating client configuration

You can use the fact that each command return a simple JSON response with the shape of the resource to move resources from different places, let say we have two authorization running called ``A`` and ``B`` and we want to import the client and realm from ``A`` to ``B``.

First we get the resources from ``A``, the client and realm:

```sh
node sso.js get client --project=sso-dev --url=https://A-rhsso:443 --realm=my-realm  client.json
node sso.js get realm --project=sso-dev --url=https://A-rhsso:443 realm.json
```

Notice that we save this resources in two files ``realm.json`` and ``client.json``, now lets move those objects to the ``B`` RHSSO:

```sh
node sso.js post realm --url=https://B-rhsso:443  --from-file=realm.json
node sso.js post client --url=https://B-rhsso:443 --realm=demorealm --from-file=client.json
```

> To make sure everything is correct and assuming the client belongs to the realm described by the realm.json file, we need to import first the realm then the client.


### Automating The Testing Of SPI Plugins

Basically this can be resumed in 3 stages:

#### First

The first stage we unit test, package and deploy the SPI plugin into RHSSO, this deployment can be done by two ways:

- It can be hot-deployed by inserting the ``jar`` directly into the RHSSO container:

```sh
oc cp your-spi.jar rhsso-pod:/opt/eap/standalone/deployments/
```

> This is good to quickly test new features in an isolated environment.


- Or you can use to bundle it in a container, by doing a custom build (more on that later).

#### Second

Next we configure the Keycloak SPI component:

```
node sso.js post storage --url=https://my-sso --realm=<your-realm> --from-file=./storage.json
```  

This how a storage component looks like, but they may look different:

```xml
{
	"name": "My Sign-On Integrator",
	"providerId": "My Sign-On Integrator",
	"providerType": "org.keycloak.storage.UserStorageProvider",
	"config": {
		"my-plugin-endpint": ["http://my-federated-service/users"],
		"cachePolicy": ["NO_CACHE"],
		"priority": ["0"],
		"enabled": ["true"],
		"evictionDay": [],
		"evictionHour": [],
		"evictionMinute": [],
		"maxLifespan": []
	}
}
```

This will configure the storage component inside the ``realm``, now we need to perform an action to see if the plugin is well integrated. In my case I wanted to see if the plugin can recover a user, the easiest way todo this is to login with a user that belong to that plugin.

```sh
node sso.js openid --url=https://my-sso --realm=MY-REALM --client=my-client --username=user-from-storage --password=password
```

If everything went well we should get back a JWT token in plain text.


#### Third

We can now use this JSON to perform some checks in Jenkins, like testing that the information is correct.


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
