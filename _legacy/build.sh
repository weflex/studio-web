#!/usr/bin/env bash
#

grunt snapshot
ssh root@www.theweflex.com 'rm -rf /var/www/html/*'
scp -r out/* root@www.theweflex.com:/var/www/html/
