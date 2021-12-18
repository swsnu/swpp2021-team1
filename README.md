[![Build Status](https://travis-ci.com/swsnu/swpp2021-team1.svg?branch=master)](https://app.travis-ci.com/swsnu/swpp2021-team1)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=swsnu_swpp2021-team1&metric=alert_status)](https://sonarcloud.io/dashboard?id=swsnu_swpp2021-team1)
[![Coverage Status](https://coveralls.io/repos/github/swsnu/swpp2021-team1/badge.svg?branch=master)](https://coveralls.io/github/swsnu/swpp2021-team1?branch=master)

https://rejourn.world/
Above is a successful deployed version of the app. You may use this link as a reference.

## Create Google Map API Key

Please consult [this link](https://developers.google.com/maps/documentation/javascript/get-api-key#creating-api-keys) to create your own Google Map API key. Then, you may proceed to ‘Start Frontend’.

## Start FrontEnd

1. `cd frontend`
2. `echo REACT_APP_GOOGLE_MAPS_API_KEY=[YOURAPIKEY] > .env.development `
   - Please replace `[YOURAPIKEY]` with your Google Map API key you created above!

3. `yarn install`

4. `yarn start`

## Start BackEnd

1. Install and activate virtualenv
 - It's a virtual environment for django.

2. `cd backend/rejourn/rejourn`

3. `echo GOOGLE_MAPS_API_KEY=[YOURAPIKEY] > .env `
   - Please replace `[YOURAPIKEY]` with your Google Map API key you created above!

4. `cd ..`

5. `pip install -r requirements.txt`

6. `python3 manage.py makemigrations project`

7. `python3 manage.py migrate`

8. `python3 manage.py runserver`
