FROM node:8.11.2

RUN apt-get update \
  && apt-get install -y libtool nasm python-yaml
RUN curl -sSL -o /usr/local/bin/argo https://github.com/argoproj/argo/releases/download/v2.1.1/argo-linux-amd64 \
  && chmod +x /usr/local/bin/argo
RUN curl -sSL -o /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64 \
  && chmod +x /usr/local/bin/jq
RUN curl -LO https://github.com/ksonnet/ksonnet/releases/download/v0.12.0/ks_0.12.0_linux_amd64.tar.gz \
    && tar zxf ks_0.12.0_linux_amd64.tar.gz \
    && mv ks_0.12.0_linux_amd64/ks /usr/bin/ks \
    && rm -r ks_0.12.0_linux_amd64 \
    && rm ks_0.12.0_linux_amd64.tar.gz
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.7/bin/linux/amd64/kubectl \
    && chmod +x ./kubectl \
    && mv ./kubectl /usr/bin/kubectl

WORKDIR /halley

COPY jsonnet ./
RUN mv jsonnet /usr/bin/jsonnet

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN cp docker/gitconfig /root/.gitconfig

RUN set -x \
    && node_modules/.bin/webpack --config webpack.server.config.js \
    && node_modules/.bin/webpack --config webpack.client.config.js

EXPOSE 3000

CMD ["/bin/bash"]
