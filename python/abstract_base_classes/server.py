from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException


class NoEmailError(Exception):
    pass


class NoCredentialsError(HTTPException):
    description = "Integration credentials are missing"


class Server(Flask):
    """ This should be considered a `framework` of sort to create a REST service for some contacts """

    def __init__(self, broker_cls, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._broker_cls = broker_cls
        self.register_routes()

    def register_routes(self):
        self.route("/")(self.index)
        self.route("/contact", methods=["GET"])(self.get_contact)
        self.route("/contact", methods=["POST"])(self.create_contact)

    def _parse_credentials(self, header):
        parsed = {}
        for field in header.split(","):
            k, v = field.split("=")
            parsed[k] = v
        return parsed

    @property
    def _broker(self):
        header = request.headers.get("Integration-Credentials")
        if not header:
            raise NoCredentialsError()
        credentials = self._parse_credentials(header)
        return self._broker_cls(credentials)

    def index(self):
        return jsonify({"message": "Welcome to our example wrapper"})

    def get_contact(self):
        email = request.args["email"]
        return jsonify({"url": self._broker.get_contact_url(email)})

    def create_contact(self):
        data = request.json
        first_name = data["first_name"]
        last_name = data["last_name"]
        email = data["email"]
        return jsonify({"url": self._broker.create_contact(email, first_name, last_name)})
