from bit import PrivateKeyTestnet
from rest_framework import serializers

from payment.models import BtcAddress


class BtcAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = BtcAddress
        fields = ('id', 'address', 'expired', 'time_left', 'expected_amount',
                  'expired', 'time_left', 'paid_amount', 'done')
        extra_kwargs = {
            'address': {'read_only': True},
            'private_key': {'read_only': True},
            'paid_amount': {'read_only': True},
        }

    def create(self, validated_data):
        key = PrivateKeyTestnet()
        return BtcAddress.objects.create(
            **validated_data,
            address=key.address,
            private_key=key.to_hex()
        )