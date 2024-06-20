# Proyecto Ortegada 

Este proyecto de nodejs que utiliza contenerización con Docker y Docker Compose para múltiples servicios (Base de datos Mysql, back-end y front-end).
A continuación, se describen los pasos para generar el archivo `docker-compose.yml` para un entorno de producción y un `docker-compose-dev.yml` para un entorno de desarrollo.

## Prerrequisitos

Se debe tener instalado Docker y Docker Compose:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Pasos para generar el docker-compose.yml

Nota: Asegurarse de contar con un archivo `.env` con los valores de las variables de entorno necesarias para el servicio de la `base de datos` tanto de producción, como de desarrollo

1. **Crear un archivo docker-compose.yml**

   Crear un archivo llamado `docker-compose.yml` en la raíz de todo el proyecto y copiar esto:
    
   ```yaml  
   version: '3.9'

   services:
     mysqldb:
       image: mysql:latest
       container_name: ortegada-mysqldb
       environment:
         - MYSQL_ROOT_PASSWORD=${DB_PROD_PASSWORD}
         - MYSQL_DATABASE=${DB_PROD_DATABASE}
         - MYSQL_USER=${DB_PROD_USERNAME}
         - MYSQL_PASSWORD=${DB_PROD_PASSWORD}
       volumes:
         - db_mysql:/var/lib/mysql
       ports:
         - "${DB_PROD_PORT}:3306"
       networks:
         - ortegadanet
       healthcheck:
         test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "--silent"]
         interval: 5s
         timeout: 10s
         retries: 10
         start_period: 5s

     app-ortegada-back-end:
       build: ./Ortegada-back-end
       container_name: ortegada-back-end
       image: ortegada-back-end-image:v1
       ports:
         - "3000:3000"
       depends_on:
         mysqldb:
           condition: service_healthy
       links:
         - mysqldb
       networks:
         - ortegadanet

     app-ortegada-front-end:
       build: ./Ortegada-front-end
       image: ortegada-front-end-image:v1
       container_name: ortegada-front-end
       ports:
         - "3001:3000"
       depends_on:
         - app-ortegada-back-end
       networks:
         - ortegadanet

   volumes:
     db_mysql:

   networks:
     ortegadanet:

## Pasos para generar el docker-compose-dev.yml

1. **Crear un archivo docker-compose-dev.yml**

   Crear un archivo llamado `docker-compose-dev.yml` en la raíz de todo el proyecto y copiar esto:

   ```yaml
   version: '3.9'
    services:
    mysqldb-dev:
        image: mysql:latest
        container_name: ortegada-mysqldb-dev
        environment:
        - MYSQL_ROOT_PASSWORD=${DB_DEV_PASSWORD}
        - MYSQL_DATABASE=${DB_DEV_DATABASE}
        - MYSQL_USER=${DB_DEV_USERNAME}
        - MYSQL_PASSWORD=${DB_DEV_PASSWORD}
        volumes:
        - db_mysql_dev:/var/lib/mysql
        ports:
        - "${DB_DEV_PORT}:3306"
        networks:
        - ortegadanet-dev
        healthcheck:
        test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "--silent"]
        interval: 5s
        timeout: 10s
        retries: 10
        start_period: 5s
        restart: always
        
    app-ortegada-back-end-dev:
        build: 
        context: ./Ortegada-back-end
        dockerfile: Dockerfile.dev
        image: ortegada-back-end-dev-image:v1
        container_name: ortegada-back-end-dev
        volumes:
        - ./Ortegada-back-end:/home/app
        - /home/app/node_modules
        ports:
        - "3000:3000"
        depends_on:
        mysqldb-dev:
            condition: service_healthy
        links:
        - mysqldb-dev
        networks:
        - ortegadanet-dev
        restart: always

    app-ortegada-front-end-dev:
        build: 
        context: ./Ortegada-front-end
        dockerfile: Dockerfile.dev
        image: ortegada-front-end-dev-image:v1
        container_name: ortegada-front-end-dev
        volumes:
        - ./Ortegada-front-end:/home/app
        - /home/app/node_modules
        ports:
        - "3001:3000"
        depends_on:
        - app-ortegada-back-end-dev
        networks:
        - ortegadanet-dev
        restart: always


    volumes:
    db_mysql_dev:

    networks:
    ortegadanet-dev:
    