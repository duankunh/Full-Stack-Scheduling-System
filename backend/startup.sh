#!/bin/bash

sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip
sudo apt-get install -y libjpeg-dev zlib1g-dev libpng-dev
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt
python3 manage.py migrate

echo "Setup is complete. Your Django environment is ready."
