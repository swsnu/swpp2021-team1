from django.test import TestCase, Client
import json

from project.enum import Scope
from project.models.models import User, Repository, Photo, PhotoTag

import shutil
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from io import BytesIO
from PIL import Image

MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class PhotoTestCase(TestCase):
   def setUp(self):
      imageA = SimpleUploadedFile('test.jpg', b'imageA')
      imageB = SimpleUploadedFile('test.jpg', b'imageB')
      imageC = SimpleUploadedFile('test.jpg', b'imageC')
      User.objects.create_user(username='U1_USERNAME', real_name='U1_REALNAME', 
                                email='U1_EMAIL', password='U1_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U1_BIO')
      User.objects.create_user(username='U2_USERNAME', real_name='U2_REALNAME', 
                                email='U2_EMAIL', password='U2_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U2_BIO')
      User.objects.create_user(username='U3_USERNAME', real_name='U3_REALNAME', 
                                email='U3_EMAIL', password='U3_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U3_BIO')
      User.objects.create_user(username='U4_USERNAME', real_name='U4_REALNAME', 
                                email='U4_EMAIL', password='U4_PASSWORD', 
                                visibility=Scope.PUBLIC, bio='U4_BIO')
      u1 = User.objects.get(user_id=1)
      u2 = User.objects.get(user_id=2)
      u3 = User.objects.get(user_id=3)
        
      u3.friends.add(u1)

      r1 = Repository(repo_name='R1_REPONAME', visibility=Scope.PRIVATE, owner=u1) 
      r1.save()
      r1.collaborators.add(u1)
      r1.collaborators.add(u2)
      r2 = Repository(repo_name='R2_REPONAME', visibility=Scope.PUBLIC, owner=u1)
      r2.save()
      r2.collaborators.add(u1)
      r3 = Repository(repo_name='R3_REPONAME', visibility=Scope.FRIENDS_ONLY, owner=u1)  
      r3.save()
      r3.collaborators.add(u1)
      photo1 = Photo(repository=r1, image_file=imageA, uploader=u1)
      photo1.save()
      p1 = Photo.objects.get(photo_id=1)
      phototag1 = PhotoTag(user=u1, photo=p1, text="text_tag")
      phototag1.save()
      photo2 = Photo(repository=r1, image_file=imageB, uploader=u1)
      photo2.save()

   def tearDown(self):
      User.objects.all().delete()
      Repository.objects.all().delete()
      Photo.objects.all().delete()
      PhotoTag.objects.all().delete()

   def test_photos_get(self):
      client = Client()
      response = client.get('/api/repositories/5/photos/')
      self.assertEqual(response.status_code, 404)

      response = client.get('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 403)



   def test_photos_post(self):
      client = Client()
      response = client.post('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 401)

      response = client.post('/api/signin/', json.dumps({'username' : "U3_USERNAME", 'password' : "U3_PASSWORD"}), content_type='application/json')
      response = client.post('/api/repositories/5/photos/')
      self.assertEqual(response.status_code, 404)

      response = client.post('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 403)

      response = client.get('/api/signout/')
      response = client.post('/api/signin/', json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), content_type='application/json')

      # imageA = SimpleUploadedFile('test.jpg', b'imageA')
      #file = BytesIO(imageA.tobytes())
      #file.name = 'test.png'
      #file.seek(0)

      image = Image.new('RGBA', size=(50, 50), color=(155, 0, 0))
      file = tempfile.NamedTemporaryFile(suffix='.png')
      image.save(file)
      #print(image)

      #with open(file.name, 'rb') as data:
         #response = client.post('/api/repositories/1/photos/', {"FILES['image']": [image]})
         #format='multipart/form-data')
      #self.assertEqual(response.status_code, 201)


   def test_photos_put(self):
      client = Client()
      response = client.put('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 401)

      response = client.post('/api/signin/', json.dumps({'username' : "U3_USERNAME", 'password' : "U3_PASSWORD"}), content_type='application/json')
      response = client.put('/api/repositories/5/photos/')
      self.assertEqual(response.status_code, 404)

      response = client.put('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 403)

      response = client.get('/api/signout/')
      response = client.post('/api/signin/', json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), content_type='application/json')

      response = client.put('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 400)

      response = client.put('/api/repositories/1/photos/', json.dumps([{'photo_id' : 5, 'tag': "edit_text"}]), content_type='application/json')
      self.assertEqual(response.status_code, 410)

      photo1 = Photo.objects.get(photo_id=1)
      original_phototag1 = PhotoTag.objects.get(photo=photo1)
      response = client.put('/api/repositories/1/photos/', json.dumps([{'photo_id' : 1, 'tag': "edit_text"}]), content_type='application/json')
      self.assertIn("edit_text", response.content.decode())

      response = client.put('/api/repositories/1/photos/', json.dumps([{'photo_id' : 1, 'tag': ""}]), content_type='application/json')
      self.assertNotIn(original_phototag1, PhotoTag.objects.all().values())

      response = client.put('/api/repositories/1/photos/', json.dumps([{'photo_id' : 1, 'tag': "edit_again_text"}]), content_type='application/json')
      self.assertIn("edit_again_text", response.content.decode())


   def test_photos_delete(self):
      client = Client()
      response = client.delete('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 401)

      response = client.post('/api/signin/', json.dumps({'username' : "U3_USERNAME", 'password' : "U3_PASSWORD"}), content_type='application/json')
      response = client.delete('/api/repositories/5/photos/')
      self.assertEqual(response.status_code, 404)

      response = client.delete('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 403)

      response = client.get('/api/signout/')
      response = client.post('/api/signin/', json.dumps({'username' : "U1_USERNAME", 'password' : "U1_PASSWORD"}), content_type='application/json')

      response = client.delete('/api/repositories/1/photos/')
      self.assertEqual(response.status_code, 400)

      response = client.delete('/api/repositories/1/photos/', json.dumps([{'photo_id' : 5}]), content_type='application/json')
      self.assertEqual(response.status_code, 410)

      response = client.delete('/api/repositories/1/photos/', json.dumps([{'photo_id' : 1}]), content_type='application/json')
      self.assertEqual(response.status_code, 202)
      self.assertNotIn("text_tag", response.content.decode())

      response = client.delete('/api/repositories/1/photos/', json.dumps([{'photo_id' : 2}]), content_type='application/json')
      self.assertEqual(response.status_code, 202)
      






