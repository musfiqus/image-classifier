import timm
import urllib

from django.conf import settings
from pathlib import Path

from django.db.models import Model, CharField, JSONField, DateTimeField, BooleanField


ALL_AVAILABLE_MODELS = [(model, model) for model in timm.list_models(pretrained=True)]


class ImageClassification(Model):
    image_hash = CharField(primary_key=True, max_length=128)
    classification_model = CharField(max_length=128, blank=True, null=True)
    labels_url = CharField(max_length=256, blank=True, null=True)
    in_queue = BooleanField(default=False)
    predictions = JSONField(blank=True, null=True)
    date_created = DateTimeField(auto_now_add=True)
    date_updated = DateTimeField(auto_now=True)


class ClassificationModel(Model):
    model_name = CharField(
        choices=ALL_AVAILABLE_MODELS,
        default=settings.DEFAULT_CLASSIFICATION_MODEL,
        max_length=128
    )
    labels_url = CharField(default=settings.DEFAULT_LABELS_URL, max_length=256)

    def get_labels_file_name(self) -> str:
        return Path(urllib.parse.urlparse(self.labels_url).path).name


def get_classification_model() -> ClassificationModel:
    return ClassificationModel.objects.get_or_create(pk=1)[0]
