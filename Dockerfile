FROM mongo:3.0.6

COPY mongostart.sh /mongostart.sh

CMD /mongostart.sh
