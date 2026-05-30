---
title: "Install Icinga2 di Ubuntu Server dengan PostgreSQL"
date: 2024-04-06
tags:
  - icinga2
  - ubuntu
  - postgresql
  - monitoring
draft: false
---

# Install icinga2 di Ubuntu server dengan Postgresql

![Install icinga2 di Ubuntu server dengan Postgresql](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTc3M3wwfDF8c2VhcmNofDF8fHNlcnZlcnxlbnwwfHx8fDE3MTIzNzQ0MDV8MA&ixlib=rb-4.0.3&q=80&w=960)

Update dan upgrade package
    
    
    sudo apt-get update -y && sudo apt-get upgrade -y

Install nginx
    
    
    sudo apt install nginx -y
    sudo systemctl enable nginx && sudo systemctl start nginx

Cek status nginx
    
    
    sudo systemctl status nginx

Install PHP
    
    
    sudo apt-get install php8.1 php8.1-fpm php8.1-imagick php8.1-cli php8.1-common php8.1-imap php8.1-snmp php8.1-xml php8.1-zip php8.1-mbstring php8.1-curl -y

Tambah repo icinga2
    
    
    apt update
    apt -y install apt-transport-https wget gnupg
    
    wget -O - https://packages.icinga.com/icinga.key | gpg --dearmor -o /usr/share/keyrings/icinga-archive-keyring.gpg
    
    . /etc/os-release; if [ ! -z ${UBUNTU_CODENAME+x} ]; then DIST="${UBUNTU_CODENAME}"; else DIST="$(lsb_release -c| awk '{print $2}')"; fi; \
     echo "deb [signed-by=/usr/share/keyrings/icinga-archive-keyring.gpg] https://packages.icinga.com/ubuntu icinga-${DIST} main" > \
     /etc/apt/sources.list.d/${DIST}-icinga.list
     echo "deb-src [signed-by=/usr/share/keyrings/icinga-archive-keyring.gpg] https://packages.icinga.com/ubuntu icinga-${DIST} main" >> \
     /etc/apt/sources.list.d/${DIST}-icinga.list
    
    apt update

Update dan install icinga2
    
    
    sudo apt update -y
    sudo apt install icinga2 icinga2-ido-pgsql -y
    sudo systemctl start icinga2 && sudo systemctl enable icinga2

Cek status icinga2
    
    
    sudo systemctl status icinga2

Install monitoring plugin
    
    
    sudo apt-get install monitoring-plugins -y

Buat db icinga_ido
    
    
    sudo -u postgres psql -c "CREATE ROLE icinga_ido WITH LOGIN PASSWORD 'Skills39'"
    sudo -u postgres createdb -O icinga_ido -E UTF8 icinga_ido

Reload postgresql
    
    
     sudo -u postgres psql -c "SELECT pg_reload_conf()"

Install icinga2-ido-pgsql
    
    
    sudo apt install postgresql-client-14 icinga2-ido-pgsql -y

Populate db icinga_ido
    
    
    psql --username=icinga_ido --password --host=10.16.16.20 icinga_ido < /usr/share/icinga2-ido-pgsql/schema/pgsql.sql

Edit file /etc/icinga2/features-enabled/ido-pgsql.conf 

Enable feature ido-pgsql
    
    
    sudo icinga2 feature enable ido-pgsql

Restart icinga2
    
    
    sudo systemctl restart icinga2

Buat db icinga_web
    
    
    sudo -u postgres psql -c "CREATE ROLE icinga_web WITH LOGIN PASSWORD 'Skills39'"
    sudo -u postgres createdb -O icinga_web -E UTF8 icinga_web

Restart postgres
    
    
    sudo -u postgres psql -c "SELECT pg_reload_conf()"

Install icingaweb
    
    
    sudo apt install icingaweb2 icingacli -y

Remove apache2 (gatau tiba2 ke install)
    
    
    sudo apt-get remove apache2
    sudo apt-get autoremove

Konfigurasi nginx
    
    
    sudo icingacli setup config webserver nginx > /etc/nginx/sites-available/icinga
    sudo ln -s /etc/nginx/sites-available/icinga /etc/nginx/sites-enabled/

Edit file /etc/nginx/sites-available/icinga
    
    
    server {
      listen 80;
      server_name _;
    
      root /usr/share/icingaweb2/public;
      index index.php;
      access_log /var/log/nginx/access.log;
      error_log /var/log/nginx/error.log;
    
      location ~ ^/icingaweb2/index\.php(.*)$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /usr/share/icingaweb2/public/index.p>
        fastcgi_param ICINGAWEB_CONFIGDIR /etc/icingaweb2;
        fastcgi_param REMOTE_USER $remote_user;
      }
    
      location ~ ^/icingaweb2(.+)? {
        alias /usr/share/icingaweb2/public;
        index index.php;
        try_files $1 $uri $uri/ /icingaweb2/index.php$is_args$args;
      }
    }

Remove default config nginx (jika tanpa domain/dns)
    
    
    sudo rm /etc/nginx/sites-enabled/default

Buat icinga setup token
    
    
    sudo icingacli setup token create

Setup icinga2 api
    
    
    sudo icinga2 setup api

Setup master node
    
    
    icinga2 node wizard
    
    
    Welcome to the Icinga 2 Setup Wizard!
    
    We will guide you through all required configuration details.
    
    Please specify if this is an agent/satellite setup ('n' installs a master setup) [Y/n]: n
    
    Starting the Master setup routine...
    
    Please specify the common name (CN) [icinga2]: 
    Reconfiguring Icinga...
    Checking for existing certificates for common name 'icinga2'...
    Certificate '/var/lib/icinga2/certs//icinga2.crt' for CN 'icinga2' already existing. Skipping certificate generation.
    Generating master configuration for Icinga 2.
    'api' feature already enabled.
    
    Master zone name [master]: 
    
    Default global zones: global-templates director-global
    Do you want to specify additional global zones? [y/N]: n
    Please specify the API bind host/port (optional):
    Bind Host []: 
    Bind Port []: 
    
    Do you want to disable the inclusion of the conf.d directory [Y/n]: n
    
    Done.
    
    Now restart your Icinga 2 daemon to finish the installation!
    

Buka ip/icingaweb2 dan klik setup wizard

Gunakan api di command transport, lihat etc/icinga2/conf.d/api-users.conf untuk user dan passwordnya

## Setup guest agent

Buat ticket pki di master node
    
    
    icinga2 pki ticket --cn 'icinga2-agent'

Install icinga2 di agent
    
    
    sudo apt-get install icinga2 -y

Run setup node wizard
    
    
    icinga2 node wizard
    
    
    Welcome to the Icinga 2 Setup Wizard!
    
    We will guide you through all required configuration details.
    
    Please specify if this is an agent/satellite setup ('n' installs a master setup) [Y/n]: y
    
    Starting the Agent/Satellite setup routine...
    
    Please specify the common name (CN) [icinga2-agent]: 
    
    Please specify the parent endpoint(s) (master or satellite) where this node should connect to:
    Master/Satellite Common Name (CN from your master/satellite node): icinga2
    
    Do you want to establish a connection to the parent node from this node? [Y/n]: y
    Please specify the master/satellite connection information:
    Master/Satellite endpoint host (IP address or FQDN): 10.16.16.30
    Master/Satellite endpoint port [5665]: 
    
    Add more master/satellite endpoints? [y/N]: n
    Parent certificate information:
    
     Version:             3
     Subject:             CN = icinga2
     Issuer:              CN = Icinga CA
     Valid From:          Apr  6 15:47:50 2024 GMT
     Valid Until:         May  8 15:47:50 2025 GMT
     Serial:              39:12:7d:9f:90:1e:0d:86:6d:fb:0c:19:57:46:8d:43:21:dd:1b:86
    
     Signature Algorithm: sha256WithRSAEncryption
     Subject Alt Names:   icinga2
     Fingerprint:         8C BB 25 B6 5D 27 C4 E4 A9 CB 95 4B 25 05 AD 70 0F A7 67 D9 C1 25 EF 85 6A AF 52 65 ED 48 3E CF 
    
    Is this information correct? [y/N]: y
    
    Please specify the request ticket generated on your Icinga 2 master (optional).
     (Hint: # icinga2 pki ticket --cn 'icinga2-agent'): 69d4a76a42d73453989e95bb0cf5dd57762289a3
    Please specify the API bind host/port (optional):
    Bind Host []: 
    Bind Port []: 
    
    Accept config from parent node? [y/N]: y
    Accept commands from parent node? [y/N]: y
    
    Reconfiguring Icinga...
    
    Local zone name [icinga2-agent]: 
    Parent zone name [master]: 
    
    Default global zones: global-templates director-global
    Do you want to specify additional global zones? [y/N]: n
    
    Do you want to disable the inclusion of the conf.d directory [Y/n]: n
    
    Done.
    
    Now restart your Icinga 2 daemon to finish the installation!
    

Tambahkan zone berikut di master node (/etc/icinga2/zones.conf)
    
    
    object Zone "centos" {
      endpoints = [ "centos" ]
      parent = "icinga"
    }
    
    object Endpoint "centos" {
      host = "192.168.1.100"
    }
    

Buat direktori dan file icinga2-agent
    
    
    mkdir /etc/icinga2/zones.d/icinga2-agent/
    touch /etc/icinga2/zones.d/centos/icinga-agent.conf
    touch /etc/icinga2/zones.d/centos/services.conf

Isi icinga-agent.conf
    
    
    object Host "icinga2-agent" {
      import "generic-host"
      address = "10.16.16.31"
      vars.http_vhosts["http"] = {
        http_uri = "/"
      }
      vars.notification["mail"] = {
        groups = [ "icingaadmins" ]
      }
      vars.client_endpoint = name
    }
    

Isi services.conf
    
    
    object Host "icinga2-agent" {
      import "generic-host"
      address = "10.16.16.31"
      vars.http_vhosts["http"] = {
        http_uri = "/"
      }
      vars.notification["mail"] = {
        groups = [ "icingaadmins" ]
      }
      vars.client_endpoint = name
    }