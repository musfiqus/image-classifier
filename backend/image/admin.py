from django.contrib import admin
from .models import ClassificationModel, ImageClassification


# Register your models here.
admin.register(ClassificationModel)
admin.register(ImageClassification)
