#!/bin/bash

oc delete ClusterRole sso-god
oc delete ClusterRoleBinding sso-robot-god

oc create -f ./templates/ocp/robot-role.yml
oc create -f ./templates/ocp/grant.yml