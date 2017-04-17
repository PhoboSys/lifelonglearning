FROM node:7

#===================
# Timezone settings
# Possible alternative: https://github.com/docker/docker/issues/3359#issuecomment-32150214
#===================
ENV TZ "US/Pacific"
RUN echo "${TZ}" > /etc/timezone \
  && dpkg-reconfigure --frontend noninteractive tzdata

ENV DEBIAN_FRONTEND=noninteractive \
    DEBCONF_NONINTERACTIVE_SEEN=true

# http://askubuntu.com/a/235911/134645
# Remove with: sudo apt-key del 40976EAF437D05B5
RUN  apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 2EA8F35793D8809A \
  && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5 \
  && apt-key update -qqy

RUN apt-get update -qqy \
  && apt-get -qqy install \
    htop \
    sudo \
    telnet \
    bc \
    vim \
    git \
    wget \
    bzip2 \
    curl \
    unzip \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir /src

#==============================
# Scripts to run Selenium
#==============================
ADD ./package.json /package.json
RUN npm install

ADD ./entrypoint.sh /opt/bin/entrypoint.sh
RUN chmod 755 /opt/bin/entrypoint.sh

ADD ./src /src

ENTRYPOINT ["/opt/bin/entrypoint.sh"]
