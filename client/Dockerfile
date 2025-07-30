# Imagen base
FROM node:18-alpine


WORKDIR /app


COPY . .


RUN npm install


RUN npm run build -- --no-lint


EXPOSE 3100


CMD ["npm", "start"]
