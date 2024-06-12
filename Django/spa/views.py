from django.shortcuts import render

def index(request):
    return render(request, 'spa/index.html')

def pages(request, page):
    return render(request, f'spa/pages/{page}')