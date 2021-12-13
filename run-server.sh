gcloud beta compute ssh --zone "asia-northeast3-a" "rejourn"  --tunnel-through-iap --project "rejourn"
cd ../lemonshushuu
source rejourn_env/bin/activate
uwsgi --http :8000 -H /home/lemonshushuu/rejourn_env --wsgi-file /home/lemonshushuu/swpp2021-team1/backend/rejourn/rejourn/wsgi.py
