import traceback
from pathlib import Path
from typing import Any, TypedDict, List

import torch
from PIL import Image
from django.core.files.storage import FileSystemStorage
from timm.data import resolve_data_config, create_transform

from core import celery_app
from .classifier import get_model, get_labels
from .models import get_classification_model, ImageClassification


class Prediction(TypedDict):
    classes: List[str]
    probabilities: List[float]


def preprocess_image(image_file: Image.Image, model: Any) -> Any:
    # Pull the image size, interpolation method, center cropping configs for the model
    config = resolve_data_config({}, model=model)

    # Create transformation pipeline from the configuration which will be applied to the image
    transform = create_transform(**config)

    # Apply transformations to the image and add batch dimension as models take input in batches
    tensor = transform(image_file).unsqueeze(0)

    return tensor


@celery_app.task
def do_image_classification(image_hash: str, image_path: str, image_name: str) -> bool:
    current_classification = ImageClassification.objects.filter(image_hash=image_hash).first()
    storage = FileSystemStorage()

    if current_classification:
        try:
            classification_model = get_classification_model()

            model = get_model()
            labels = get_labels()

            image_storage_path = Path(image_path)

            with Image.open(image_storage_path).convert('RGB') as image:
                image_tensor = preprocess_image(image, model)

                # Disable gradient calculations during inference to save memory
                with torch.no_grad():
                    out = model(image_tensor)

                # Convert raw scores of range 0 to 1 into probabilities that sum to 1
                probabilities = torch.nn.functional.softmax(out[0], dim=0)

                top5_probabilities, top5_label_ids = torch.topk(probabilities, 5)

                predictions = Prediction(
                    classes=[labels[top5_label_ids[i]] for i in range(top5_probabilities.size(0))],
                    probabilities=[top5_probabilities[i].item() for i in range(top5_probabilities.size(0))],
                )

                current_classification.classification_model = classification_model.model_name
                current_classification.labels_url = classification_model.labels_url
                current_classification.predictions = predictions
                
        except Exception as e:
            traceback.print_exc()
            current_classification.predictions = None
            current_classification.classification_model = None
            current_classification.labels_url = None
        finally:
            current_classification.in_queue = False
            current_classification.save()

    storage.delete(image_name)

    return current_classification is not None
