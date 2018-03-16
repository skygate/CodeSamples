from rest_framework.viewsets import ModelViewSet

from payment.models import BtcAddress
from payment.serializers import BtcAddressSerializer


class BtcAddressViewSet(ModelViewSet):
    queryset = BtcAddress.objects.all()
    serializer_class = BtcAddressSerializer
