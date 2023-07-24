import io

import torch
from PIL import Image
from django.http import JsonResponse
from rest_framework import status
from timm.data import resolve_data_config, create_transform

from .classifier import get_model, get_labels


def preprocess_image(image_file, model):
    image_data = io.BytesIO(image_file.file.read())
    img = Image.open(image_data).convert('RGB')
    config = resolve_data_config({}, model=model)
    transform = create_transform(**config)
    tensor = transform(img).unsqueeze(0)
    return tensor


def classify_image(image_file):
    if not image_file:
        return JsonResponse({'error': 'Image file not provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        model = get_model()
        labels = get_labels()

        image_tensor = preprocess_image(image_file, model)
        with torch.no_grad():
            out = model(image_tensor)
        probabilities = torch.nn.functional.softmax(out[0], dim=0)

        top5_prob, top5_catid = torch.topk(probabilities, 5)

        response_data = {
            'id': image_file.name,
            'predicted_class': [labels[top5_catid[i]] for i in range(top5_prob.size(0))],
            'probabilities': [top5_prob[i].item() for i in range(top5_prob.size(0))]
        }
        return JsonResponse(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return JsonResponse({'error': 'Unable to classify image.'}, status=status.HTTP_400_BAD_REQUEST)
