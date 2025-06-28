FROM nginx:stable-alpine

# Remove página padrão do nginx
#RUN rm -rf /usr/share/nginx/html/*

# Copia arquivos buildados do Angular
COPY /dist/front-tcc /usr/share/nginx/html

# Copia o nginx.conf customizado
#COPY nginx.conf /etc/nginx/conf.d/default.conf
