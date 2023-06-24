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

RUN mkdir ~/config \
    && mv /Mandarine-main/Docker/deezerConfig.json ~/config/config.json \
    && touch ~/config/.arl

CMD echo $arl >> .arl \
    && if [ -n "$runIndexerOnStart" ] && [ "$runIndexerOnStart" -eq 1 ]; then \
        node Mandarine-main/music/indexer.js \
    fi \
    && npm start --prefix Mandarine-main