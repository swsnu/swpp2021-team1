from django.http import HttpResponse, JsonResponse

def HttpResponseSuccessGet(json_content=None):
    if json_content is None:
        return HttpResponse(status=200)
    return JsonResponse(json_content, status=200, safe=False)

def HttpResponseSuccessUpdate(json_content=None):
    if json_content is None:
        return HttpResponse(status=201)
    return JsonResponse(json_content, status=201, safe=False)

def HttpResponseSuccessDelete(json_content=None):
    if json_content is None:
        return HttpResponse(status=202)
    return JsonResponse(json_content, status=202, safe=False)

def HttpResponseSuccessGetToken(json_content=None):
    if json_content is None:
        return HttpResponse(status=204)
    return JsonResponse(json_content, status=204, safe=False)

## HttpResponseBadRequest:
## HttpResponse(status=400)

def HttpResponseNotLoggedIn():
    return HttpResponse(status=401)

def HttpResponseNoPermission():
    return HttpResponse(status=403)

def HttpResponseNotExist():
    return HttpResponse(status=404)

## HttpResponseNotAllowed:
## HttpResponse(status=405)

def HttpResponseInvalidInput():
    return HttpResponse(status=410)

def HttpResponseAlreadyProcessed():
    return HttpResponse(status=411)
