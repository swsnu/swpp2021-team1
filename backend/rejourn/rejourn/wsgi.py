"""
WSGI config for rejourn project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os
import sys
sys.path.append('/home/lemonshushuu/swpp2021-team1/backend')
sys.path.append('/home/lemonshushuu/swpp2021-team1/backend/rejourn')


from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rejourn.settings')

application = get_wsgi_application()
