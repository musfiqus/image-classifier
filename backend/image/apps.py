from django.apps import AppConfig
from .classifier import initialize_labels, initialize_model


class ImageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'image'

    def ready(self):
        initialize_labels()
        initialize_model()
