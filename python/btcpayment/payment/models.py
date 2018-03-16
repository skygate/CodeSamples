import datetime

from django.conf import settings
from django.db import models


class BtcAddress(models.Model):
    address = models.CharField(max_length=34)
    private_key = models.CharField(max_length=64)
    expected_amount = models.BigIntegerField(default=0)
    paid_amount = models.BigIntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def expired(self):
        expiration_delta = settings.PAYMENT_SETTINGS['EXPIRATION_DELTA']
        return self.created_date + expiration_delta < datetime.datetime.now()

    @property
    def time_left(self):
        expiration_delta = settings.PAYMENT_SETTINGS['EXPIRATION_DELTA']
        time_left = expiration_delta + self.created_date - datetime.datetime.now()
        return time_left if time_left > datetime.timedelta(seconds=0) else datetime.timedelta(seconds=0)

    @property
    def done(self):
        return self.paid_amount >= self.expected_amount
