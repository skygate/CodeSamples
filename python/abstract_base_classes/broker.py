from .base import BaseBroker
from xmlrpc.client import ServerProxy
from . import config


class InfusionBroker(BaseBroker):

    base_url = config["base_url"]

    def __init__(self, credentials):
        self._id = credentials["id"]
        self._key = credentials["key"]
        self._server = ServerProxy(self.base_url.format(self._id))

    def _get_contact_by_email(self, email):
        contacts = self._server.ContactService.findByEmail(
            self._key, email,
            ["FirstName", "LastName", "Email", "Id"]
        )
        if contacts:
            return contacts[0]
        else:
            return {}

    def _get_url_from_id(self, contact_id):
        return config["contact_url"].format(self._id, contact_id)

    def get_contact_url(self, email):
        contact = self._get_contact_by_email(email)
        if contact:
            return self._get_url_from_id(contact["Id"])

    def create_contact(self, email, first_name, last_name):
        new_contact = {
            "FirstName": first_name,
            "LastName": last_name,
            "Email": email,
        }
        contact_id = self.server.ContactService.addWithDupCheck(
            self._key, new_contact, "Email"
        )
        return self._get_url_from_id(contact_id)
