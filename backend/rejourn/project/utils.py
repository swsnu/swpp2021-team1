from django.utils import timezone
from uuid import uuid4
import os

def have_common_user( groupA, groupB ):
            for user in groupA:
                if user in groupB:
                    return True
            return False

def profile_upload_to_func(instance, filename):
    prefix = timezone.now().strftime("%Y/%m/%d")
    file_name = uuid4().hex
    extension = os.path.splitext(filename)[1].lower()
    return "/".join(
        ["profiles", prefix, file_name, extension,]
    )

def photo_upload_to_func(instance, filename):
    prefix = timezone.now().strftime("%Y/%m/%d")
    file_name = uuid4().hex
    extension = os.path.splitext(filename)[1].lower()
    return "/".join(
        ["photos", prefix, file_name, extension,]
    )