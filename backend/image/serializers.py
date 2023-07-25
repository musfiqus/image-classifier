from rest_framework.serializers import ModelSerializer
from .models import ImageClassification


class ImageClassificationSerializer(ModelSerializer):
    class Meta:
        model = ImageClassification
        fields = '__all__'
