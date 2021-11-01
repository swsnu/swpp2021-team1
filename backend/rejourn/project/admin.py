from django.contrib import admin

from .models import User, Repository

admin.site.register(User)
admin.site.register(Repository)
