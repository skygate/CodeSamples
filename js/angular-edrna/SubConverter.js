'use strict';

(function() {
	angular
		.module('edrnaApp')
		.provider('SubConverter', SubConverterProvider)
		.config(SubConverterCfg);

	SubConverterCfg.$inject = ['SubConverterProvider'];

	function SubConverterProvider() {
		var srcConverters = {};
		var dstConverters = {};

		this.addSrcConverter = addSrcConverter;
		this.addDstConverter = addDstConverter;
		this.$get = ['$q', function ($q) {
			return new SubConverter(srcConverters, dstConverters, $q);
		}];

		function addSrcConverter(mime, converter) {
			if(typeof mime !== 'string' || typeof converter !== 'function') {
				console.error('Converter plug-in is not a function!');
				return false;
			}

			srcConverters[mime] = converter;
		}

		function addDstConverter(mime, converter) {
			if(typeof mime !== 'string' || typeof converter !== 'function') {
				console.error('Converter plug-in is not a function!');
				return false;
			}

			dstConverters[mime] = converter;
		}
	}

	function SubConverter(srcConverters, dstConverters, $q) {
		var supportedSrc = Object.keys(srcConverters);
		var supportedDst = Object.keys(dstConverters);

		return {
			newConverter: newConverter,
			isSupportedSrc: isSupportedSrc,
			isSupportedDst: isSupportedDst
		};

		function newConverter() {
			return new converter();
		}

		function isSupportedSrc(mime) {
			return supportedSrc.indexOf(mime) !== -1;
		}

		function isSupportedDst(mime) {
			return supportedDst.indexOf(mime) !== -1;
		}

		function converter() {
			var self = this;
			var source = '';
			var srcMime = '';
			var dstMime = '';
			var destination = '';

			this.load = load;
			this.from = from;
			this.to = to;
			this.convert = convert;

			function load(data) {
				var defer = $q.defer();
				source = srcMime = dstMime = destination = '';

				if(typeof data === 'string') {
					source = data;
					defer.resolve();
				}

				if(data instanceof Blob) {
					var fr = new FileReader();
					fr.onload = function(e) {
						source = e.target.result;
						srcMime = fr.type;
						defer.resolve();
					};
					fr.readAsText(data);
				}

				return defer.promise;
			}

			function from(mime) {
				if(!isSupportedSrc(mime)) {
					console.error('Source subtitle format not supported: ' + mime);
					return false;
				}

				srcMime = mime;
				return self;
			}

			function to(mime) {
				if(!isSupportedDst(mime)) {
					console.error('Destination subtitle format not supported: ' + mime);
					return false;
				}

				dstMime = mime;
				return self;
			}

			function convert() {
				var parsedData = srcConverters[srcMime](source);
				var converted = dstConverters[dstMime](parsedData);

				return converted;
			}
		}
	}

	function SubConverterCfg(SubConverterProvider) {
		SubConverterProvider.addSrcConverter('application/x-subrip', function(data) {
			var lines = [];
			var index = 0;
			var previousLine;
			var currentLine = {};

			var addToStack = function() {
				lines[currentLine.number] = {
					start: currentLine.start,
					end: currentLine.end,
					data: currentLine.data
				};
				currentLine = {};
			}

			data.split('\n').forEach(function(dataLine, dataIndex) {
				/* Empty space */
				if(!/\S/.test(dataLine)) {
					addToStack();

					previousLine = dataLine;
					return;
				}

				/* Index */
				if((!/\S/.test(previousLine) || !previousLine) && parseInt(dataLine, 10) !== null) {
					currentLine.number = parseInt(dataLine, 10);

					previousLine = dataLine;
					return;
				}

				/* Timing */
				if(dataLine.indexOf('-->') !== -1 && parseInt(previousLine, 10) !== null) {
					var timings = dataLine.split(' --> ');

					currentLine.start = {
						h: parseInt(timings[0].split(':')[0], 10),
						m: parseInt(timings[0].split(':')[1], 10),
						s: parseInt(timings[0].split(':')[2], 10),
						mili: parseInt(timings[0].split(',')[1], 10)
					};
					currentLine.end = {
						h: parseInt(timings[1].split(':')[0], 10),
						m: parseInt(timings[1].split(':')[1], 10),
						s: parseInt(timings[1].split(':')[2], 10),
						mili: parseInt(timings[1].split(',')[1], 10)
					};

					previousLine = dataLine;
					return;
				}

				/* Subtitle itself */
				currentLine.data = Array.isArray(currentLine.data) ? currentLine.data : [];
				
				dataLine = dataLine.replace(/<b>/g, '{\\b1}').replace(/<\/b>/g, '{\\b0}');
				dataLine = dataLine.replace(/<i>/g, '{\\i1}').replace(/<\/i>/g, '{\\i0}');
				dataLine = dataLine.replace(/<u>/g, '{\\u1}').replace(/<\/u>/g, '{\\u0}');

				currentLine.data.push(dataLine);
				previousLine = dataLine;

				/* Last dialogue */
				if(dataIndex === data.split('\n').length - 1) {
					addToStack();
				}
			});

			lines = lines.filter(function(l) { return true; });

			return lines;
		});

		SubConverterProvider.addSrcConverter('text/vtt', function(data) {
			var lines = [];
			var index = 0;
			var previousLine;
			var currentLine = {};

			var addToStack = function() {
				lines[currentLine.number] = {
					start: currentLine.start,
					end: currentLine.end,
					data: currentLine.data
				};
				currentLine = {};
			}

			if(!/WEBVTT FILE/.test(data.split('\n')[0])) return [];

			data.split('\n').forEach(function(dataLine, dataIndex) {
				/* Empty space */
				if(!/\S/.test(dataLine)) {
					addToStack();

					previousLine = dataLine;
					return;
				}

				/* Index */
				if((!/\S/.test(previousLine) || !previousLine) && parseInt(dataLine, 10) !== null) {
					currentLine.number = parseInt(dataLine, 10);

					previousLine = dataLine;
					return;
				}

				/* Timing */
				if(dataLine.indexOf('-->') !== -1 && parseInt(previousLine, 10) !== null) {
					var timings = dataLine.split(' --> ');
					var cue = timings[1].split(' ');
					timings[1] = cue[0];
					cue.shift();

					currentLine.start = {
						h: parseInt(timings[0].split(':')[0], 10),
						m: parseInt(timings[0].split(':')[1], 10),
						s: parseInt(timings[0].split(':')[2], 10),
						mili: parseInt(timings[0].split(',')[1], 10)
					};
					currentLine.end = {
						h: parseInt(timings[1].split(':')[0], 10),
						m: parseInt(timings[1].split(':')[1], 10),
						s: parseInt(timings[1].split(':')[2], 10),
						mili: parseInt(timings[1].split(',')[1], 10)
					};

					previousLine = dataLine;
					return;
				}

				/* Subtitle itself */
				currentLine.data = Array.isArray(currentLine.data) ? currentLine.data : [];
				
				dataLine = dataLine.replace(/<b>/g, '{\\b1}').replace(/<\/b>/g, '{\\b0}');
				dataLine = dataLine.replace(/<i>/g, '{\\i1}').replace(/<\/i>/g, '{\\i0}');
				dataLine = dataLine.replace(/<u>/g, '{\\u1}').replace(/<\/u>/g, '{\\u0}');
				dataLine = dataLine.replace(/<c.highlight>/g, '{\\1c&HCCFFFF&}').replace(/<\/c>/g, '{\\1c}');

				currentLine.data.push(dataLine);
				previousLine = dataLine;

				/* Last dialogue */
				if(dataIndex === data.split('\n').length - 1) {
					addToStack();
				}
			});

			lines = lines.filter(function(l) { return true; });

			return lines;
		});

		SubConverterProvider.addSrcConverter('text/xml', function(data) {
			data = data.substring(data.indexOf('<transcript>'), data.indexOf('</transcript>'));
			data = data.replace('<transcript>', '');

			var parsed = [];
			var lines = data.split('</text>');
			var tagRegex = /^<text start="([0-9]+(.|)([0-9]+|))" dur="([0-9]+(.|)([0-9]+|))">/;
			// lines = lines.filter(function(line) { return line.match(tagRegex) !== null; });

			lines.forEach(function(line) {
				var matched = line.match(tagRegex);

				if(matched === null) return;

				var start = parseFloat(matched[1], 10) * 1000;
				var end = parseFloat(matched[4], 10) * 1000;
				var text = line.replace(tagRegex, '');
				var el = angular.element(document.createElement('textarea'));
				var epoch = new Date(0);
				epoch.setHours(0);
				start = new Date(epoch.getTime() + start);
				end = new Date(start.getTime() + end);
				text = text.replace(/\&amp;/g, '&');
				text = el.html(text).text();

				parsed.push({
					start: {
						h: start.getHours(),
						m: start.getMinutes(),
						s: start.getSeconds(),
						mili: start.getMilliseconds()
					},
					end: {
						h: end.getHours(),
						m: end.getMinutes(),
						s: end.getSeconds(),
						mili: end.getMilliseconds()
					},
					data: text.split('\n')
				});
			});


			return parsed;
		});

		SubConverterProvider.addDstConverter('text/x-ssa', function(data) {
			var result = '';
			result += '[Script Info]\n';
			result += '; Script generated by Junction\n';
			result += '; http://www.junctioneducation.com/\n';
			result += 'ScriptType: v4.00+\n';
			result += 'WrapStyle: 0\n';
			result += 'PlayResX: 640\n';
			result += 'PlayResY: 480\n';
			result += 'ScaledBorderAndShadow: yes\n';
			result += 'VideoAspectRatio: 0\n';
			result += 'VideoZoom: 6\n';
			result += 'VideoPosition: 0\n';
			result += 'Last Style Storage: Default\n';
			result += '\n';
			result += '[V4+ Styles]\n';
			result += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
			result += 'Style: Default,Arial,25,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,3,1,1,2,10,10,30,1\n';
			result += '\n';
			result += '[Events]\n';
			result += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

			function toFixed(number, len) {
				while((number + '').length > len) {
					number = (number + '').substring(0, (number + '').length-1);
				}

				while((number + '').length < len) {
					number = '0' + number;
				}

				return number;
			}

			data.forEach(function(line) {
				result += 'Dialogue: ';
				result += '0,';
				result += toFixed(line.start.h, 1) + ':' + toFixed(line.start.m, 2) + ':' + toFixed(line.start.s, 2) + '.' + toFixed(line.start.mili, 2) + ',';
				result += toFixed(line.end.h, 1) + ':' + toFixed(line.end.m, 2) + ':' + toFixed(line.end.s, 2) + '.' + toFixed(line.end.mili, 2) + ',';
				result += 'Default,,0,0,0,,';
				result += line.data.join('\\N');
				result += '\n';
			});
			
			return result;
		});
	}
})();
