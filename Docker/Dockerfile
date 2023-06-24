FROM node:16-alpine
LABEL maintainer="https://github.com/karyeet"

COPY ../ /Mandarine/

RUN apk add python3\
    && apk add --no-cache --virtual .gyp \
        make \
        g++ \
        py3-pip\        
    && npm install --prefix Mandarine \
    && python3 -m pip install deemix\
    && apk del .gyp

RUN mkdir ~/config \
    && mv /Mandarine/Docker/deezerConfig.json ~/config/config.json \
    && touch ~/config/.arl

CMD echo $arl >> .arl \
    && if [ -n "$runIndexerOnStart" ] && [ "$runIndexerOnStart" -eq 1 ]; then \
        node Mandarine/music/indexer.js \
    fi \
    && npm start --prefix Mandarine