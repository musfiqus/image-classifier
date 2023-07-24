from mongoengine import Document
from mongoengine.fields import DateTimeField, DictField, FileField, StringField


class Image(Document):
    file_name = StringField(required=True)
    image = FileField(required=True, upload_to='images/')
    image_hash = StringField(required=True)
    content_type = StringField(required=True)
    date_created = DateTimeField(required=True)
    classification = DictField()
