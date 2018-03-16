from django.db import models
from django.db.models.base import ModelBase

class SurveyQuestionMetaClass(ModelBase):
    GENDER_RELATED_ATTRIBUTES = dict(
        prod_avghrspastweek='_weekly_hours_worked_summed',
        prod_avghrsexpectedweek='_weekly_hours_expected_summed',
        prod_missdayother='_missed_full_days_other_reason_summed',
        prod_misspartdayother='_missed_partially_days_other_reason_summed',
        prod_avghrsmonth='_monthly_hours_worked_summed',
        prod_qualityworkpastyear=None,
        prod_qualityworkpastmonth='_quality_of_work_summed',
    )

    def __new__(mcs, name, bases, attrs):
        super_new = super(SurveyQuestionMetaClass, mcs).__new__
        result_class = super_new(mcs, name, bases, attrs)

        for attribute in filter(lambda attributes: attributes in attrs, mcs.GENDER_RELATED_ATTRIBUTES):
            setattr(
                result_class, 'set_data_for_{attribute}'.format(attribute=attribute), mcs.generate_method(attribute)
            )

        return result_class

    @classmethod
    def generate_method(mcs, name):
        def increment_corresponding_data_model_field_value(self, instance, sex):
            attribute_name = mcs.GENDER_RELATED_ATTRIBUTES[name]
            value = getattr(self, name)
            self.set_sex_dependent_attribute(instance, attribute_name, value, sex)

        return increment_corresponding_data_model_field_value

class SurveyBaseModel(models.Model, metaclass=SurveyQuestionMetaClass):
    @staticmethod
    def set_sex_dependent_attribute(instance, attribute_name_without_gender, value, sex):
        if not attribute_name_without_gender:
            raise TypeError("[male/female]{} doesn't have corresponding attribute name!".format(
                attribute_name_without_gender))

        if not hasattr(instance, ''.join(('male', attribute_name_without_gender))):
            import pdb;pdb.set_trace()
            raise AttributeError("[male/female]{} doesn't exist!".format(attribute_name_without_gender))

        if sex == 'M':
            name = ''.join(('male', attribute_name_without_gender))

        elif sex == 'F':
            name = ''.join(('female', attribute_name_without_gender))

        try:
            instance.__dict__[name] += value
        except TypeError:
            setattr(instance, name, value)


class ProductivityModel(SurveyBaseModel):
    prod_avghrspastweek = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(97)])
    prod_avghrsexpectedweek = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(97)])
    prod_missdayother = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(28)])
    prod_misspartdayother = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(28)])
    prod_avghrsmonth = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(350)])
    prod_qualityworkpastmonth = models.PositiveIntegerField(null=True, blank=True, validators=[MaxValueValidator(10)])

    def save_all_productivity_into_storage_model(self, instance, sex):
        self.set_data_for_prod_avghrspastweek(instance, sex)
        self.set_data_for_prod_avghrsexpectedweek(instance, sex)
        self.set_data_for_prod_missdayother(instance, sex)
        self.set_data_for_prod_misspartdayother(instance, sex)
        self.set_data_for_prod_avghrsmonth(instance, sex)
        self.set_data_for_prod_qualityworkpastmonth(instance, sex)

        self.set_sex_dependent_attribute(instance, '_assessments_count', 1, sex)
