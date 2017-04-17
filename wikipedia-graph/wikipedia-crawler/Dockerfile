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

ADD ./src/graphical-session/xvfb /etc/init.d/xvfb
RUN chmod 755 /etc/init.d/xvfb

ADD ./src/graphical-session/start-graphical-session /usr/bin/start-graphical-session
RUN chmod 755 /usr/bin/start-graphical-session

ADD ./src/graphical-session/chrome_launcher.sh /opt/google/chrome/google-chrome
RUN chmod 755 /opt/google/chrome/google-chrome

ADD ./entrypoint.sh /opt/bin/entrypoint.sh
RUN chmod 755 /opt/bin/entrypoint.sh

ADD ./src /src

ENTRYPOINT ["/opt/bin/entrypoint.sh"]
