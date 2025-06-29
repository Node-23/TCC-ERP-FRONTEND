FROM node:20-slim
WORKDIR /app

# Copia os resultados do build
COPY /dist/front-tcc /app/dist/front-tcc
# Copia o package.json e package-lock.json para instalar dependências de produção do server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Define a porta que o servidor Node.js vai escutar
ENV PORT=4000
EXPOSE 4000
# Comando para iniciar o servidor Node.js SSR
# O Angular CLI geralmente gera o 'main.js' dentro da pasta 'server'
CMD ["node", "dist/front-tcc/server/server.mjs"]