# Use una imagen base de Node.js que también tenga Python instalado
FROM node:14-buster

# Instalar Python y pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto que tu aplicación va a usar
EXPOSE 8080

# Comando para iniciar tu aplicación
CMD [ "node", "src/index.js" ]
