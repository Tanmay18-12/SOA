FROM openfaas/classic-watchdog:0.18.1 as watchdog

FROM python:3.9-slim

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog

RUN apt-get update && apt-get install -y \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pillow

WORKDIR /home/app

COPY handler.py           .
COPY requirements.txt     .

RUN pip install -r requirements.txt

ENV fprocess="python3 handler.py"
ENV mode="http"

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
