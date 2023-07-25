from django.urls import path
from . import views

urlpatterns = [
    path('classify/', views.classify_view, name='classify_view'),
    path('get_classification/', views.get_image_classification_view, name='get_image_classification_view'),
]
