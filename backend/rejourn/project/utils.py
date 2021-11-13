import os
from uuid import uuid4

from django.utils import timezone


def have_common_user(group_a, group_b):
    for user in group_a:
        if user in group_b:
            return True
        return False


def profile_upload_to_func(instance, filename):
    prefix = timezone.now().strftime("%Y/%m/%d")
    file_name = uuid4().hex
    extension = os.path.splitext(filename)[1].lower()
    return "/".join(
        [
            "profiles",
            prefix,
            file_name,
            extension,
        ]
    )


def photo_upload_to_func(instance, filename):
    prefix = timezone.now().strftime("%Y/%m/%d")
    file_name = uuid4().hex
    extension = os.path.splitext(filename)[1].lower()
    return "/".join(
        [
            "photos",
            prefix,
            file_name,
            extension,
        ]
    )
