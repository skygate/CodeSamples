import aiohttp
import re
import asyncio

urls = [
    "http://onet.pl",
    "http://interia.pl",
    "http://google.com",
    "http://twitter.com",
    "http://github.com",
]

TITLE_REGEX = re.compile(r"<title>(.*)</title>", re.IGNORECASE | re.DOTALL)


async def _get_title(url):
    resp = await aiohttp.get(url)
    content = await resp.text()
    title = re.search(TITLE_REGEX, content).group(1)
    return title


async def get_titles():
    coros = tuple(_get_title(url) for url in urls)
    titles = await asyncio.gather(*coros)
    print("\n".join(titles))


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(get_titles())
    loop.close()
