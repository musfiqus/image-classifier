import io
import time
import traceback
from typing import TypedDict, Optional, List, Any

import torch
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status
from timm.data import resolve_data_config, create_transform
from pathlib import Path

from .classifier import get_model, get_labels
from .models import ImageClassification, get_classification_model, ClassificationModel
from .serializers import ImageClassificationSerializer


class ApiResponse(TypedDict):
    success: bool
    data: Optional[dict]
    message: str


class Prediction(TypedDict):
    classes: List[str]
    probabilities: List[float]


def is_classification_required(
        current_classification: ImageClassification
) -> bool:
    if not current_classification:
        return True

    classification_model = get_classification_model()
    if classification_model.model_name != current_classification.classification_model:
        return True
    if classification_model.labels_url != current_classification.labels_url:
        return True

    return False


def get_image_classification(image_hash: Optional[str]) -> JsonResponse:
    start_time = time.time()
    current_classification = ImageClassification.objects.filter(image_hash=image_hash).first()

    if not is_classification_required(current_classification):
        processing_time = round((time.time() - start_time) * 1000, 2)
        return JsonResponse(ApiResponse(
            success=True,
            data=ImageClassificationSerializer(current_classification).data,
            message=f'{processing_time} ms'))
    else:
        processing_time = round((time.time() - start_time) * 1000, 2)
        return JsonResponse(ApiResponse(
            success=False,
            data=None,
            message=f'{processing_time} ms'))


def preprocess_image(image_file: InMemoryUploadedFile, model: Any) -> Any:
    image_data = io.BytesIO(image_file.file.read())
    img = Image.open(image_data).convert('RGB')
    config = resolve_data_config({}, model=model)
    transform = create_transform(**config)
    tensor = transform(img).unsqueeze(0)
    return tensor


def classify_image(image_file):
    start_time = time.time()
    try:
        if not image_file or not image_file.name:
            return JsonResponse({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

        classification_model = get_classification_model()
        image_hash = Path(image_file.name).stem
        current_classification = ImageClassification.objects.filter(image_hash=image_hash).first()

        model = get_model()
        labels = get_labels()

        image_tensor = preprocess_image(image_file, model)
        with torch.no_grad():
            out = model(image_tensor)
        probabilities = torch.nn.functional.softmax(out[0], dim=0)

        top5_prob, top5_catid = torch.topk(probabilities, 5)

        predictions = Prediction(
            classes=[labels[top5_catid[i]] for i in range(top5_prob.size(0))],
            probabilities=[top5_prob[i].item() for i in range(top5_prob.size(0))],
        )

        if not current_classification:
            current_classification = ImageClassification(
                image_hash=image_hash,
                classification_model=classification_model.model_name,
                labels_url=classification_model.labels_url,
                date_created=timezone.now()
            )

        current_classification.classification_model = classification_model.model_name
        current_classification.labels_url = classification_model.labels_url
        current_classification.predictions = predictions
        current_classification.date_updated = timezone.now()
        current_classification.save()

        processing_time = round((time.time() - start_time) * 1000, 2)
        return JsonResponse(ApiResponse(
            success=True,
            data=ImageClassificationSerializer(current_classification).data,
            message=f'{processing_time} ms'
        ), status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        traceback.print_exc()
        processing_time = round((time.time() - start_time) * 1000, 2)
        return JsonResponse(ApiResponse(
            success=False,
            data=None,
            message=f'{processing_time} ms'
        ), status=status.HTTP_400_BAD_REQUEST)
