from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FileUploadParser

from .services import classify_image, get_classification


@api_view(['GET'])
def get_classification_view(request):
    image_hash = request.query_params.get('image_hash', None)
    return get_classification(image_hash)


@api_view(['POST'])
@parser_classes([FileUploadParser])
def classify_view(request):
    image_file = request.FILES.get('file', None)
    return classify_image(image_file)
