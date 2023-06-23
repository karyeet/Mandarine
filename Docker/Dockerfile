FROM node:16-alpine
LABEL maintainer="https://github.com/karyeet"

RUN wget https://github.com/karyeet/Mandarine/archive/refs/heads/main.zip \
	&& unzip main.zip

RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && npm install --prefix Mandarine-main \
    && apk del .gyp

RUN apk add python3 \
			py3-pip \
	&& python3 -m pip install deemix

CMD node Mandarine-main/music/indexer.js && npm start --prefix Mandarine-main