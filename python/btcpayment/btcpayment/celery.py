import os
import celery
import datetime
import logging
from celery import Celery

from django.conf import settings
from django.db.models import Q, F


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'btcpayment.settings')

app = Celery('btcpayment', broker='redis://localhost:6379/0')
app.config_from_object('django.conf:settings')

app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@celery.decorators.periodic_task(run_every=datetime.timedelta(seconds=10))
def monitor_payments():
    from payment.models import BtcAddress
    from payment.bitcoin_utils import AddressManager

    for btc_address in BtcAddress.objects.filter(~Q(expected_amount__exact=F('paid_amount'))):
        manager = AddressManager.from_hex(btc_address.private_key)
        manager.update_address(btc_address)
