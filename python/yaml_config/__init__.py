import os
import yaml


def get_config():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    config_file = os.path.join(base_dir, "config.yml")
    with open(config_file, "r") as configfile:
        cfg = yaml.load(configfile)

    environment = os.environ.get("APP_ENVIRONMENT", "prod")
    config = cfg["DEFAULT"]
    config.update(cfg[environment])

    return config

config = get_config()
