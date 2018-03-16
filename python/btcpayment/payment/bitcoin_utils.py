import logging

from django.conf import settings
from bit import PrivateKeyTestnet

from payment.models import BtcAddress

manager_logger = logging.getLogger('AddressManager')
manager_logger.setLevel(logging.INFO)


class AddressManager:
    def __init__(self, address, key=None):
        self.address = address
        self.key = key

    def _key_attribute_required(f):

        def wrapper(self: 'class', *args, **kwargs):
            if not self.key:
                raise ValueError(f"`key` attribute is not set in {self}")

            return f(self, *args, **kwargs)

        return wrapper

    @staticmethod
    def from_hex(private_hex: str):
        key = PrivateKeyTestnet.from_hex(private_hex)
        return AddressManager(key.address, key)

    @_key_attribute_required
    def sum_of_unspent(self, confirmations=settings.PAYMENT_SETTINGS['MIN_CONFIRMATIONS']):
        return sum([unspent.amount for unspent in self.key.get_unspents() if unspent.confirmations >= confirmations])

    def update_address(self, address: BtcAddress):
        paid, expected = address.paid_amount, address.expected_amount

        new_paid = self.sum_of_unspent()
        if new_paid > paid:
            manager_logger.info(f'Address {address.address} received payment')
        elif new_paid < paid:
            manager_logger.warning('Looks like you withdraw already money from this address')

        address.paid_amount = new_paid
        address.save()
