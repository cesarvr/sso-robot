#!/bin/bash

oc start-build bc/sso-bot -n cicd --from-file=. --follow
