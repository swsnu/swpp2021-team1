[![Build Status](https://travis-ci.com/swsnu/swpp2021-team1.svg?branch=master)](https://app.travis-ci.com/swsnu/swpp2021-team1)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=swsnu_swpp2021-team1&metric=alert_status)](https://sonarcloud.io/dashboard?id=swsnu_swpp2021-team1)
[![Coverage Status](https://coveralls.io/repos/github/swsnu/swpp2021-team1/badge.svg?branch=master)](https://coveralls.io/github/swsnu/swpp2021-team1?branch=master)

## Create Google Map API Key

Please consult [this link](https://developers.google.com/maps/documentation/javascript/get-api-key#creating-api-keys) to create your own Google Map API key. Then, you may proceed to ‘Start Frontend’.

## Start FrontEnd

1. `cd frontend`
2. `echo REACT_APP_GOOGLE_MAPS_API_KEY=[YOURAPIKEY] > .env.development `
   - Please replace `YOURAPIKEY` with your Google Map API key issued from the Google developer console!

2. `yarn install`

3. `yarn start`

## Start BackEnd

- `cd backend && cd rejourn`
- `python3 manage.py makemigrations project`
- `python3 manage.py migrate`
- `python3 manage.py runserver`

