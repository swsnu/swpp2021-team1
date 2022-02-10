[![Build Status](https://travis-ci.com/swsnu/swpp2021-team1.svg?branch=master)](https://app.travis-ci.com/swsnu/swpp2021-team1)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=swsnu_swpp2021-team1&metric=alert_status)](https://sonarcloud.io/dashboard?id=swsnu_swpp2021-team1)
[![Coverage Status](https://coveralls.io/repos/github/swsnu/swpp2021-team1/badge.svg?branch=master)](https://coveralls.io/github/swsnu/swpp2021-team1?branch=master)

https://rejourn.world/
Above is a successful deployed version of the app. You may use this link as a reference.

## Create Google Map API Key

Please consult [this link](https://developers.google.com/maps/documentation/javascript/get-api-key#creating-api-keys) to create your own Google Map API key. Then, you may proceed to next steps.

## Run in Development Mode

### 1. Clone Repository

```bash
git clone https://github.com/swsnu/swpp2021-team1.git
cd swpp2021-team1
```

### 2. Copy Google Maps API Keys into Files

```bash
echo REACT_APP_GOOGLE_MAPS_KEY=[YOUR_API_KEY] >> frontend/.env.development
echo GOOGLE_MAPS_API_KEY=[YOUR_API_KEY] >> backend/rejourn/rejourn/.env
```

Replace `[YOUR_API_KEY]` with your Google Map API key.

### 3. Start Frontend

```bash
cd frontend
yarn install && yarn start
```

The frontend should be accessible through http://localhost:3000.

### 4. Start Backend

#### Prerequisite

- Python 3.7 should be the default python version on your machine; otherwise, [create a virtual environment](https://docs.python.org/3/tutorial/venv.html) and activate it.

```bash
cd ../backend/rejourn
pip install -r requirements.txt
python manage.py makemigrations project
python manage.py migrate
python manage.py runserver
```

The backend should be accessible through http://localhost:8000.

## Deploy with Docker Compose

#### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) should be installed on your machine.
- Nginx configuration in this repository uses and requires SSL. Please make sure you prepare your own SSL certificate and private key. If you’re just fine with HTTP, erase parts related to SSL in `docker-compose.yml` and `nginx/nginx-ssl.conf`, and skip step 3.

### 1. Clone Repository

```bash
git clone https://github.com/swsnu/swpp2021-team1.git
cd swpp2021-team1
```

### 2. Copy Google Maps API Keys into Files

```bash
# Note that you need `.env` file on production,
# while you need `.env.development` file on development.
echo REACT_APP_GOOGLE_MAPS_KEY=[YOUR_API_KEY] >> frontend/.env
echo GOOGLE_MAPS_API_KEY=[YOUR_API_KEY] >> backend/rejourn/rejourn/.env
```

Replace `[YOUR_API_KEY]` with your Google Map API key.

### 3. Configure SSL

```bash
cd nginx

# Copy SSL certificate and key files
cp [YOUR_SSL_CERTIFICATE_FILE] certs/
cp [YOUR_PRIVATE_KEY_FILE] certs/

# Use your favorite editor to open `nginx-ssl.conf`.
vim nginx-ssl.conf
```

Then, replace the lines with `ssl_certificate` and `ssl_certificate_key` as below:

```nginx
	ssl_certificate		/certs/[YOUR_SSL_CERTIFICATE_FILE]
	ssl_certificate_key	/certs/[YOUR_PRIVATE_KEY_FILE]
```

If you’re done, save and exit the editor.

### 4. Build Images & Run Docker Compose

```bash
cd ..
sudo docker-compose up -d
```

Make sure you properly run migrations on databases before using the service!
- **Please use `manage.py` for development mode, and `manage_prod.py` for production.**

Now, visit your public domain and you’ll see the app is deployed.