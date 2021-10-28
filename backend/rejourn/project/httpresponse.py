from django.http import HttpResponse

def HttpResponseInvalidInput():
    return HttpResponse(status=410)

def HttpResponseNotLoggedIn():
    return HttpResponse(status=401)

def HttpResponseNoPermission():
    return HttpResponse(status=403)

def HttpResponseNotExist():
    return HttpReponse(status=404)