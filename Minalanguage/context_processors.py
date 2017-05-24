from mina.models import Outline


def class_outlines(request):
    classes = Outline.objects.filter(parent__isnull=True)
    return {
        'classes': classes
    }
