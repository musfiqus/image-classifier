from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, Client

from .models import ImageClassification


class ImageClassificationTests(TestCase):
    def setUp(self):
        self.client = Client()
        sha1_prefix = '93e91db601710f9e739960'

        # Create a new image using Pillow and save it to a temporary file
        img = Image.new('RGB', (60, 30), color='red')
        self.temp_image = NamedTemporaryFile(prefix=sha1_prefix, suffix='.jpg')
        img.save(self.temp_image, 'JPEG')
        self.temp_image.seek(0)  # Important: reset file pointer to beginning

        self.image_client = Client(headers={'Content-Disposition': f'form-data; name="file"; filename="{self.temp_image.name}"'})
        self.image_hash = Path(self.temp_image.name).stem

    def test_classify_view(self):
        with open(self.temp_image.name, 'rb') as img_file:
            response = self.image_client.post(
                '/image/classify/',
                {'file': SimpleUploadedFile(f"{self.image_hash}.jpg", img_file.read())},
                format='multipart'
            )

        self.assertEqual(response.status_code, 200)
        content = response.json()
        self.assertTrue(content['success'])
        self.assertEqual(content['data']['image_hash'], self.image_hash)
        self.assertEqual(content['data']['in_queue'], True)

    def test_get_classification_view(self):
        # Create a classification in the database for the test
        ImageClassification.objects.create(image_hash=self.image_hash, in_queue=False, predictions={})
        response = self.client.get('/image/get_classification/', {'image_hash': self.image_hash})
        self.assertEqual(response.status_code, 200)
        content = response.json()
        self.assertTrue(content['success'])
        self.assertEqual(content['data']['image_hash'], self.image_hash)

    def test_get_classification_view_no_classification(self):
        response = self.client.get('/image/get_classification/', {'image_hash': 'nonexistent_hash'})
        self.assertEqual(response.status_code, 404)
        content = response.json()
        self.assertFalse(content['success'])
        self.assertEqual(content['message'], 'Image classification not found.')
