FROM node:16-alpine
LABEL maintainer="https://github.com/karyeet"

RUN wget https://github.com/karyeet/Mandarine/archive/refs/heads/main.zip \
	&& unzip main.zip

RUN apk add python3\
    && apk add --no-cache --virtual .gyp \
        make \
        g++ \
        py3-pip\        
    && npm install --prefix Mandarine-main \
    && python3 -m pip install deemix\
    && apk del .gyp

    

CMD node Mandarine-main/music/indexer.js && npm start --prefix Mandarine-main