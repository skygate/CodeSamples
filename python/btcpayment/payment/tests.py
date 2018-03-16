import unittest.mock
from unittest.mock import Mock

from django.test import TestCase
from bit import PrivateKeyTestnet

from payment.bitcoin_utils import AddressManager


class AddressManagerTestCase(TestCase):

    def setUp(self):
        self.manager_without_key: AddressManager = AddressManager('a' * 34)
        self.manager_with_key: AddressManager = AddressManager.from_hex(PrivateKeyTestnet().to_hex())

    def test_cannot_get_balance_without_private_key(self):
        self.assertRaises(ValueError, self.manager_without_key.sum_of_unspent)

    def test_can_get_balance_with_private_key(self):

        with unittest.mock.patch.object(self.manager_with_key, 'key') as key_mock:
            key_mock.get_unspents.return_value = self._get_unspents(amount=10)
            sum_of_unspents = self.manager_with_key.sum_of_unspent()
            self.assertEqual(sum_of_unspents, 10)

    def test_update_addresses(self):
        satoshi_received = 100

        with unittest.mock.patch.object(self.manager_with_key, 'key') as key_mock:
            key_mock.get_unspents.return_value = self._get_unspents(amount=satoshi_received)
            address_instance = self._get_address()

            self.manager_with_key.update_address(address_instance)
            self.assertEqual(address_instance.paid_amount, 100)

    def _get_unspents(self, amount):
        if amount < 10:
            raise ValueError("amount has to be bigger or equal to 10")

        unspent_1 = Mock()
        unspent_2 = Mock()

        unspent_1.configure_mock(
            confirmations=3,
            amount=amount-10
        )

        unspent_2.configure_mock(
            confirmations=3,
            amount=10
        )

        return [unspent_1, unspent_2]

    def _get_address(self):
        address_mock = Mock()
        address_mock.configure_mock(
            address='a'*34,
            paid_amount=0,
            expected_amount=100
        )
        return address_mock
