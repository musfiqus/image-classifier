import traceback
from pathlib import Path
from typing import TypedDict, Optional

from django.core.files.storage import FileSystemStorage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import status

from .models import ImageClassification
from .serializers import ImageClassificationSerializer
from .tasks import do_image_classification


class ApiResponse(TypedDict):
    success: bool
    data: Optional[dict]
    message: str


def get_classification(image_hash: Optional[str], check_progress: bool = False) -> JsonResponse:
    query = Q(image_hash=image_hash)

    # We are not sending responses without prediction values if it's a regular request
    if not check_progress:
        query &= Q(predictions__isnull=False)

    current_classification = ImageClassification.objects.filter(query).first()

    if current_classification:
        return JsonResponse(ApiResponse(
            success=True,
            data=ImageClassificationSerializer(current_classification).data,
            message=''), status=status.HTTP_200_OK)
    else:
        return JsonResponse(ApiResponse(
            success=False,
            data=None,
            message='Image classification not found.'
        ), status=status.HTTP_404_NOT_FOUND)


def classify_image(image_file: InMemoryUploadedFile) -> JsonResponse:
    try:
        if not image_file or not image_file.name:
            return JsonResponse(ApiResponse(
                success=False,
                data=None,
                message='Image file not provided'
            ), status=status.HTTP_400_BAD_REQUEST)

        image_hash = Path(image_file.name).stem

        # get_or_create returns a tuple, getting the first element which is the object
        current_classification = ImageClassification.objects.get_or_create(image_hash=image_hash)[0]

        # Already in queue, no need to create another task
        if current_classification.in_queue:
            return JsonResponse(ApiResponse(
                success=True,
                data=ImageClassificationSerializer(current_classification).data,
                message=''
            ), status=status.HTTP_200_OK)

        # Temporarily save the image
        storage = FileSystemStorage()
        storage.save(image_file.name, image_file.file)

        current_classification.predictions = None
        current_classification.in_queue = True
        current_classification.save()

        # Send to celery for heavy ML task
        do_image_classification.delay(
            image_hash=image_hash, image_path=storage.path(image_file.name), image_name=image_file.name
        )

        return JsonResponse(ApiResponse(
            success=True,
            data=ImageClassificationSerializer(current_classification).data,
            message=''
        ), status=status.HTTP_200_OK)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse(ApiResponse(
            success=False,
            data=None,
            message='Unable to classify the provided image.'
        ), status=status.HTTP_400_BAD_REQUEST)
