from rest_framework.routers import DefaultRouter

from payment.views import BtcAddressViewSet


router = DefaultRouter()
router.register(r'payment', BtcAddressViewSet)


urlpatterns = router.urls