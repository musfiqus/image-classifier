import urllib
from typing import Any

import timm

from .models import get_classification_model

MODEL = None
LABELS = None


def initialize_model() -> None:
    global MODEL
    if not MODEL:
        classification_model = get_classification_model()
        MODEL = timm.create_model(classification_model.model_name, pretrained=True)
        MODEL = MODEL.eval()


def initialize_labels() -> None:
    global LABELS
    if not LABELS:
        classification_model = get_classification_model()
        url, file_name = classification_model.labels_url, classification_model.get_labels_file_name()
        urllib.request.urlretrieve(url, file_name)
        with open(file_name, "r") as f:
            LABELS = [s.strip() for s in f.readlines()]


def get_model() -> Any:
    global MODEL
    initialize_model()
    return MODEL


def get_labels() -> Any:
    global LABELS
    initialize_labels()
    return LABELS
