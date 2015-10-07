from rest_framework import viewsets

from .serializers import PlanSerializer
from . import models


class PlanViewSetMetaclass(type):

    def __new__(klass, model):
        class_name = "{}ViewSet".format(model.__name__)
        queryset = model.objects.all()
        serializer_class = PlanSerializer
        return type(
            class_name,
            (viewsets.ModelViewSet,),
            {
                'model': model,
                'queryset': queryset,
                'serializer_class': serializer_class
            },
        )


DidPlanViewSet = PlanViewSetMetaclass(models.DidPlan)
CpanelPlanViewSet = PlanViewSetMetaclass(models.CpanelPlan)
OtherPlanViewSet = PlanViewSetMetaclass(models.OtherPlan)
PbxPlanViewSet = PlanViewSetMetaclass(models.PbxPlan)
SipChannelPlanViewSet = PlanViewSetMetaclass(models.SipChannelPlan)
