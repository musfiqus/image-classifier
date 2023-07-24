from rest_framework_mongoengine.serializers import DocumentSerializer
from .models import Image


class ImageSerializer(DocumentSerializer):
    class Meta:
        model = Image
        fields = '__all__'
