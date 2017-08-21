from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
import sys

# data = json.load(sys.stdin)


@csrf_exempt
def home(request):
    if request.is_ajax():
        try:
            data = request.body
            print data
            x = json.loads(data)
            return HttpResponse("Fetched")
        except Exception as e:
            print e
            raise e
    else:
	    return HttpResponse("NONE")
