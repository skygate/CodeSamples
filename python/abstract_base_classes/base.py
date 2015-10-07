import abc


class BaseBroker(metaclass=abc.ABCMeta):

    @abc.abstractmethod
    def get_contact_url(self, email):
        """ Gets contact's profile URL from CRM """
        pass

    @abc.abstractmethod
    def create_contact(self, email, first_name, last_name):
        """
        Creates contact in CRM. and returns contact's URL

        :param email         Contact's email
        :param first_name    Contact's first_name
        :param last_name     Contact's last_name
        """
        pass
