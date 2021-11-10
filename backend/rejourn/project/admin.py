from django.contrib import admin

from project.models.models import *

admin.site.register(User)
admin.site.register(Repository)
admin.site.register(Photo)
admin.site.register(PhotoTag)
admin.site.register(Discussion)
admin.site.register(DiscussionComment)
admin.site.register(Post)
admin.site.register(PhotoInPost)
admin.site.register(PostComment)
