# Front-End

Aplicación front-end hecha con Nextjs que utiliza contenerización con Docker.
Seguir los siguientes pasos para generar los archivos Dockerfile (entorno de producción) y Dockerfile.dev (entorno de desarrollo)

## Prerrequisitos

Se debe tener instalado Docker y Docker Compose:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Pasos para generar Dockerfile

1. **Crear un archivo Dockerfile**

   Crear un archivo llamado `Dockerfile` en la raíz del proyecto front-end y copiar esto:

   ```Dockerfile
   FROM node:18

   WORKDIR /home/app

   COPY package*.json ./

   RUN npm install

   COPY . .

   RUN npm run build

   CMD ["npm", "run", "start"]

## Pasos para generar Dockerfile.dev

1. **Crear un archivo Dockerfile.dev**

   Crear un archivo llamado `Dockerfile.dev` en la raíz del proyecto front-end y copiar esto:

   ```Dockerfile
    FROM node:18

    WORKDIR /home/app

    COPY package*.json ./

    RUN npm install

    COPY . .

    CMD ["npm", "run", "dev"]
