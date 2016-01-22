import os
import pyinotify
import time
import xml.etree.ElementTree as ET


class EventHandler(pyinotify.ProcessEvent):

    def _get_language(self, root):
        return root.find("source-language").attrib["name"]

    def _get_target_languages(self, root):
        return (i.attrib["name"] for i in root.find("target-languages").iter("language"))

    def _get_content(self, root):
        return root.find("content").text

    def process_IN_CREATE(self, event):
        with open(event.pathname) as f:
            root = ET.fromstring(f.read())

        source_lang = self._get_language(root)
        target_languages = tuple(self._get_target_languages(root))
        content = self._get_content(root)

        print("Source language: {}\nTarget languages: {}\nPlain-text content: {}".format(
            source_lang, target_languages, content))


wm = pyinotify.WatchManager()

notifier = pyinotify.ThreadedNotifier(wm, EventHandler())
notifier.daemon = True
notifier.start()


input_path = "inputs"
wdd = wm.add_watch(input_path, pyinotify.IN_CREATE, rec=True)
os.makedirs(input_path, exist_ok=True)


if __name__ == "__main__":
    while True:
        time.sleep(3)
        print("Proof it works in background")

    notifier.stop()
