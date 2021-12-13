내가 안 까먹으려고 적어놓음.

## 명령어 정리

- GCP 접속 (gcloud 설치 먼저 필요, 브라우저에서 로그인 필요)

  ```shell
  gcloud beta compute ssh --zone "asia-northeast3-a" "rejourn"  --tunnel-through-iap --project "rejourn"
  ```

- 프로젝트, virtualenv 폴더가 있는 곳 : `/home/lemonshushuu`
  - lemonshushu랑 lemonshushuu가 있는데, u 두개 붙은거임!!! 주의!

- wsgi 실행 (백그라운드) 

  ```bash
  source /home/lemonshushuu/rejourn_env/bin/activate
  uwsgi --http :8000 -H /home/lemonshushuu/rejourn_env --wsgi-file /home/lemonshushuu/swpp2021-team1/backend/rejourn/rejourn/wsgi.py --daemonize=/home/lemonshushuu/swpp2021-team1/backend/rejourn/rejourn/rejourn.log
  ```

### nginx 관련

- configuration file 위치 : `/etc/nginx/sites-available/nginx.conf`

- 종료 및 재실행

  ```bash
  sudo systemctl r
  ```

  

## 버그 해결방법

- cannot find module ‘rejourn’ : wsgi.py에 다음 추가

  ```python
  import os
  import sys
  sys.path.append('/home/lemonshushuu/swpp2021-team1/backend')
  sys.path.append('/home/lemonshushuu/swpp2021-team1/backend/rejourn')
  ```

- yarn -> no directory named ‘install’ : cmdtest, yarn 제거후, 구글링해서 나오는 소스에서 yarn 재설치