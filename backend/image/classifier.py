import urllib
from typing import Any, List

import timm

MODEL = None
LABELS = None


def initialize_model() -> None:
    global MODEL
    if not MODEL:
        MODEL = timm.create_model('efficientnetv2_rw_m.agc_in1k', pretrained=True)
        MODEL = MODEL.eval()


def initialize_labels() -> None:
    global LABELS
    if not LABELS:
        url, filename = (
            "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt", "imagenet_classes.txt"
        )
        urllib.request.urlretrieve(url, filename)
        with open("imagenet_classes.txt", "r") as f:
            LABELS = [s.strip() for s in f.readlines()]


def get_model() -> Any:
    global MODEL
    initialize_model()
    return MODEL


def get_labels() -> List[str]:
    global LABELS
    initialize_labels()
    return LABELS
