#!/bin/bash

# Start SSH service
/usr/sbin/sshd

# Start Nginx
nginx -g "daemon off;" 