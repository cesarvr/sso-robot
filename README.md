 SSO-Robot

Just a Openshift (operator like) written in Node.js to automate Red Hat Single Sign-On deployments and manage its resources.

![](https://github.com/cesarvr/sso-robot/blob/master/img/how-to-use.png?raw=true)

I wrote this to simplify the process of writing plugins in SSO, with this *operator* you should be able to write your plugin locally and automate its deployment into a RHSSO instance running on OpenShift.


You can orchestrate actions like:

- Deployment of Red Hat Single Sign-On (RHSSO). (Ephemeral or MySQL backed)
- SPI configuration like Federation/Storage plugins.
- OpenID authentication using (Direct Grant style), so you can test your plugin.
- Automate the creation of clients and realms.
- It does BuildConfig/ImageStream creation for custom RRHSSO image creation.
- And is easy to extend.

## Installation

First you need to clone the project and add the environment variable (``OKD_SERVER``) pointing to your Openshift REST API: 

- Windows:

```sh
  npm install 
  set OKD_SERVER=https://my-openshift.com
```

- Linux:

```sh
  npm install 
  export OKD_SERVER=https://my-openshift.org
```

Then you need a token from Openshift, you can obtain one by doing: 

```sh
  oc whoami -t
  #gdFfxkC7DEsBOfg...
```

Now you can install this ``bot`` like this:

```sh
node sso.js install robot --project=my-project --token=M2gsjzRR_....euGxleM --name=my-rhsso-deployer
```

This will deploy a instance of the bot in your Openshift, here is the meaning of the options: 

  - **project:** Is the namespace where you want to deploy the bot, just make sure that the ``token`` has privilege to perform the require actions (can create, watch, etc) in that namespace/project.

  - **name:** The name of the ``bot``. 


If everything went correctly now your should have a bot (running inside a pod) waiting for instructions, but before you deploy anything you need to give it some permissions, if your ``token/user`` has permissions to create [roles](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#api-overview) and [role-binding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#api-overview) via the REST API then you can do this:

```sh
node sso.js role new --token=M2gsjzRR_....euGxleM --name=my-rhsso-deployer --project=my-project 
```




## Now You Can Automate On RHSSO

### Deployments

As we saw in the above example you can create one or multiple instance in a namespace (or various if you grant give it the correct roles): 

You can run it locally: 

```sh
   node sso.js deploy create --token=M2gsjzRR_....uGxleM --name=sso73 --project=my-project
```

This is a good choice if you want to do a quick test, but if you want to trigger this from some CI/CD framework, you can run it from the pod:

```sh
   oc exec <pod-running-robot> -- node sso.js deploy create --name=sso73 --project=my-project
```

> Running it from the pod doesn't require the ``token`` or any other configuration as it will pick it up from the pod ``service account`` that share the same name as the bot. 


### Custom Images 

You can create custom images using the ``image create`` command: 

```sh
 node sso.js image create  --name=<image-name> --project=<your-project> --token=<only-if-you-are-using-it-locally>
```

-----

#### Example

You can use this to create custom RHSSO images, here is an example on how to create a custom image with some theorethical plugins:


##### Image Creation
-----

Let's say you have this Dockerfile, which add the plugins: 

```Dockerfile
   FROM openshift-sso-73:latest # this get overrided by the build configuration.

   ADD my-spi-plugins pt/eap/standalone/deployments/
   
   USER 1001
```
To create the image you just need to run this: 

```sh
 node sso.js image create  --name=rhsso-with-plugins --project=my-project --token=<only-if-you-are-using-it-locally>
 oc start-build -n my-project --follow bc/rhsso-with-plugins --from-file=Dockerfile
```



##### Custom Image Deployment
-----

We got our custom image let's deploy it, in our previous example we created a RHSSO instance called ```sso73``` let's reuse this instance by changing its **default** image with our **custom one**: 

```sh
  node sso.js image update --name=sso73 --project=my-project --image=rhsso-with-plugins --token=<only-if-you-are-using-it-locally>
```


### Watch Deployments

If you want to track the deployment of the **custom one**: 

```sh
node sso.js deploy watch --name=sso73 --project=my-project --token=<only-if-you-are-using-it-locally>
# Watching....

# Do some test
```

This feature is very interesting if you are writing your own [Keycloak Plugins](https://github.com/keycloak/keycloak/tree/master/examples/providers/domain-extension), to automate test post-deployment. 

Also this can be useful to automatically configure your RHSSO after it being deployed like adding some realms and clients. 


### Adding Realms

Now that our RHSSO is running and ready let's automate some realms and client creation let's start with realms: 

First you need to define a file a simple realm structure like this one: 

```json
{
	"id":"my-ad",
	"realm":"my-ad",
	"displayName": "Realm for Active Directory Users",
	"displayNameHtml": "Active Directory Realm",
	"enabled": true
}
```
Let's call it ```realm.json``` and configure this into our ```sso73``` instance: 

```sh
 node sso.js post realm --url=https://my-project.sso73.org --from-file=realm.json 
```


### Adding Clients

Adding a clients its more of the same first you need a file: 

```json
{
  "clientId": "my-client",
  "surrogateAuthRequired": false,
  "enabled": true,
  "clientAuthenticatorType": "client-secret"
}
```
Let's call it ```client.json``` and configure this into our ```sso73``` instance: 

```sh
 node sso.js post client --url=https://my-project.sso73.org --from-file=client.json --realm=my-ad
```


### Copying Resources Between Instances 

If you want to migrate objects from one instance to another you can use the ``get`` command: 

```sh
    node sso.js get client --name=ad-connector --url=https://old-rhsso.sso72.org --realm=my-old-realm >> client.json
```

This will copy the OpenID client called ``ad-connector`` from another instance into a file, now let's export this to our ``sso73`` instance: 

```sh
    node sso.js post client --url=https://my-project.sso73.org --from-file=client.json --realm=my-ad
```

You can use this with all supported resources. 





### Pipeline Example 

Let's say we want to write a pipeline stage where we want to automate the creation of a custom image and we want to deploy this image and wait until the image is fully deploy:  


```sh 

        // Assume we clone a folder called tmp with a Dockerfile and some Keycloak plugins here...

        stage('Creating & Deploying Image'){
            steps {
                script{
                    sh "oc exec <pod-running-robot> -- node sso.js image create  --name=my-image --project=my-project"
                    sh "oc exec <pod-running-robot> -- node sso.js image update --name=sso73 --project=my-project --image=my-image"
                    sh "oc exec <pod-running-robot> -- node sso.js deploy watch --name=sso73 --project=my-project"
                }
            }
        }
        
        stage('Run some test over this new instance...') //...
```


## What Can I Do With This ?


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
