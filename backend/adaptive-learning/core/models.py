# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from cpkmodel.cpkmodel import CPkModel


class User(CPkModel):
    uid = models.TextField(primary_key=True)
    username = models.TextField(unique=True)
    fname = models.TextField()
    mname = models.TextField()
    lname = models.TextField()
    email = models.TextField(unique=True)
    password = models.TextField()
    createat = models.DateTimeField(db_column='createAt')  # Field name made lowercase.
    role = models.TextField()  # This field type is a guess.
    status = models.TextField()  # This field type is a guess.
    avata_url = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'User'