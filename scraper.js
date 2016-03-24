#!/usr/bin/env node

// node modules
var path = require("path");
var url = require("url");
var fs = require("fs");

// npm modules
var scrapyard = require("scrapyard");
var moment = require("moment");
var debug = require("debug")("scraper");
var queue = require("queue");
var clone = require("clone");

// config
var config = require("./config.js");

// create instance of scrapyard
var scrape = new scrapyard({
	retries: 3,
	connections: 10,
	cache: null
});

function scraper(opts, fn){
	if (!(this instanceof scraper)) return new scraper(opts, fn);
	var self = this;

	// optionalize options
	if (typeof opts === "function") {
		var fn = opts;
		var opts = {};
	};
	self.opts = (typeof opts === "object") ? opts : {};

	// check for imgcache option, resolve path
	if (!opts.hasOwnProperty("imgcache") || typeof opts.imgcache !== "string" || opts.imgcache === "") opts.imgcache = false;
	if (opts.imgcache) {
		opts.imgcache = path.resolve(process.cwd(), opts.imgcache);
		debug("caching speaker images in %s", opts.imgcache);
	}

	// check for outdir option, resolve path
	if (!opts.hasOwnProperty("outdir") || typeof opts.outdir !== "string" || opts.outdir === "") opts.outdir = false;
	if (opts.outdir) {
		opts.outdir = path.resolve(process.cwd(), opts.outdir);
		debug("writing data to %s", opts.outdir);
	}

	// event data
	self.data = {
		event: config.event,
		days: [], // autofilled
		formats: [],
		langs: [],
		levels: [],
		locations: [],
		maps: [],
		pois: [],
		recordings: [],
		sessions: [],
		speakers: [],
		tracks: []
	};
	
	// translation table
	self.translate = {
		speakers: {},
		days: [],
		locations: {},
		tracks: {},
		formats: {},
		levels: {},
		langs: {},
		sessions: {},
	};
	
	// reverse resolve table
	self.reverse = {
		speakers: {},
		locations: {},
		tracks: {},
		formats: {},
		levels: {},
		langs: {}
	};
	
	// calculate days and translations
	(function(done){
		var dayid = 0;
		var t_cur = moment(self.data.event.begin, "YYYY-MM-DD").add(config.dayend,'hours');
		var t_end = moment(self.data.event.end, "YYYY-MM-DD").add(1,'day').add(config.dayend,'hours');
		
		while (t_cur.valueOf() < t_end.valueOf()) {
			var begin = moment(t_cur); //.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
			var end = moment(t_cur.add(1,'day')); //.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
			var id = [self.data.event.id, "day", ++dayid].join("-");

			// add to days
			self.translate.days.push([begin.valueOf(), end.valueOf(), (self.data.days.push({
				"id": id,
				"type": "day",
				"event": self.data.event.id,
				"date": begin.format("YYYY-MM-DD"),
				"begin": begin.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
				"end": end.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
				"label_de": begin.locale("de").format("D. MMM"),
				"label_en": begin.locale("en").format("MMM D")
			})-1)]);

		}
		
		done();
		
	})(function(){

		// check if callback is given
		if (typeof fn !== "function") return;
	
		// fetch data
		self.fetch(function(err, result){
			if (err) return debug("error fetching data: %s", err) || fn(err);

			// parse data
			self.parse(result, function(err, data){
				if (err) return debug("error parsing data: %s", err) || fn(err);
				return fn(null, data, self.opts.outdir);
			});

		});
		
	});
	
	return this;
};

// helper for determining which day a point in time belogns to
scraper.prototype.day = function(date){
	for (var i = 0; i < this.translate.days.length; i++) if (this.translate.days[i][0] <= date.valueOf() && this.translate.days[i][1] > date.valueOf()) return this.data.days[this.translate.days[i][2]];
	return null;
};

// fetch http resources
scraper.prototype.fetch = function(fn){
	var self = this;

	var q = queue();

	var result = {};
		
	q.push(function(next){
		scrape({
			method: "GET",
			url: config.session_url,
			type: "json"
		}, function(err, data){
			if (err) return debug("error fetching sessions: %s", err) || next(err);
			debug("fetched sessions");
			result.sessions = data.items;
			next();
		});
	});
	
	q.push(function(next){
		scrape({
			method: "GET",
			url: config.speaker_url,
			type: "json"
		}, function(err, data){
			if (err) return debug("error fetching speakers: %s", err) || next(err);
			debug("fetched speakers");
			result.speakers = data.items;
			next();
		});
	});
	
	q.start(function(err){
		if (err) return fn(err);
		fn(null, result);
	});
	
	return this;
};

// helper for autochecking string properties
scraper.prototype.strprop = function(obj, prop){
	if (!obj.hasOwnProperty(prop)) return null;
	if (typeof obj[prop] !== "string") return null;
	obj[prop] = obj[prop].replace(/^\s+|\s+$/g,'');
	if (obj[prop] === "") return null;
	return obj[prop];
};

// resolve links in speaker profiles
scraper.prototype.links = function(data){
	
	// split adn combine items
	var links = [];
	data = data.map(function(v){ return v.split(/,\s+/g) });
	data[0].forEach(function(v,i){
		links.push({
			"type": "speaker-link",
			"service": "web",
			"url": v,
			"title": data[1][i]
		});
	});
		
	// filter invalid links and determine services
	// i went the extra lightyear here ;)
	links = links.filter(function(v){
		return true; // FIXME: implement filtering of broken urls
	}).map(function(link){
		
		if (url.parse(link.url).host) switch (url.parse(link.url).host.replace(/^(.*\.)?([^\.]+\.[^\.]+)$/,"$2")) {
			case "twitter.com":
				var match = link.url.match(/https?:\/\/(www\.)?twitter\.com\/(@|%40)?([a-zA-Z0-9\_]+)(#|\?|$|\/)/i);
				if (match) {
					link.service = "twitter";
					link.username = match[3];
				}
			break;
			case "instagram.com":
				var match = link.url.match(/https?:\/\/(www\.)?instagram\.com\/([^\/\?#]+)(#|\?|$|\/)/i);
				if (match) {
					link.service = "instagram";
					link.username = match[2];
				}
			break;
			case "facebook.com":
			case "facebook.de":
				var match = link.url.match(/https?:\/\/([0-9a-z\-]+\.)*facebook\.[a-z]+\/([^\/\?]+)(\?|$|\/)/i);
				if (match && match[2] !== "pages" && match[2] !== "profile.php") {
					link.service = "facebook";
					link.username = match[2];
				}
			break;
			case "xing.com":
				var match = link.url.match(/https?:\/\/(www\.)?xing\.com\/profile\/([^\/\?]+)(\?|$|\/)/i);
				if (match) {
					link.service = "xing";
					link.username = match[2];
				}
			break;
			case "linkedin.com":
				var match = link.url.match(/https?:\/\/([0-9a-z\-]+\.)*linkedin\.com\/(in|pub|profile)\/([^\/\?]+)($|\/)/i);
				if (match) {
					link.service = "linkedin";
					link.username = match[3];
				}
			break;
			case "youtube.com":
				var match = link.url.match(/https?:\/\/(www\.)?youtube\.com\/(user\/)?([^\/\?]+)($|\/)/i);
				if (match && match[3] !== "channel") {
					link.service = "youtube";
					link.username = match[3];
				}
			break;
			case "about.me":
				var match = link.url.match(/https?:\/\/(www\.)?about\.me\/([^\/]+)($|\/)/i);
				if (match) {
					link.service = "about.me";
					link.username = match[2];
				}
			break;
			case "app.net":
				var match = link.url.match(/https?:\/\/([0-9a-z\-]+\.)*app\.net\/([^\/]+)($|\/)/i);
				if (match) {
					link.service = "app.net";
					link.username = match[2];
				}
			break;
			case "github.io":
				var match = link.url.match(/https?:\/\/(www\.)?(.*)\.github\.io/);
				if (match) {
					link.service = "github";
					link.username = match[2];
				}
			break;
			case "github.com":
				var match = link.url.match(/https?:\/\/(www\.)?github\.com\/([^\/]+)($|\/)/i);
				if (match) {
					link.service = "github";
					link.username = match[2];
				}
			break;
			case "soundcloud.com":
				var match = link.url.match(/https?:\/\/(www\.)?soundcloud\.com\/([^\/]+)($|\/)/i);
				if (match) {
					link.service = "soundcloud";
					link.username = match[2];
				}
			break;
			case "vimeo.com":
				var match = link.url.match(/https?:\/\/(www\.)?vimeo\.com\/([^\/]+)($|\/)/i);
				if (match && !/^[0-9]+$/.test(match[2])) { // filter out video links
					link.service = "vimeo";
					link.username = match[2];
				}
			break;
			case "wikipedia.org":
				var match = link.url.match(/https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/(Benutzer|User):([^\/]+)($|\/)/);
				if (match) {
					link.service = "wikipedia";
					link.username = match[3];
				}
			break;
			case "flattr.com":
				var match = link.url.match(/https?:\/\/(www\.)?flattr\.com\/profile\/([^\/]+)($|\/)/);
				if (match) {
					link.service = "flattr";
					link.username = match[2];
				}
			break;
			case "keybase.io":
				var match = link.url.match(/https?:\/\/(www\.)?keybase\.io\/([^\/]+)($|\/)/);
				if (match) {
					link.service = "keybase";
					link.username = match[2];
				}
			break;
			case "medium.com":
				var match = link.url.match(/https?:\/\/(www\.)?medium\.com\/(@|%40)([^\/]+)($|\/)/);
				if (match) {
					link.service = "medium";
					link.username = match[3];
				}
			break;
			case "re-publica.de":
				// people who manage to just write @name for their twitter link
				var match = link.url.match(/https:\/\/re-publica\.de\/%40([^\/]+)$/);
				if (match) {
					link.service = "twitter";
					link.url = "https://twitter.com/"+match[1];
					link.username = match[1];
				}
			break;
			case "speakerinnen.org":
				var match = link.url.match(/https?:\/\/(www\.)?speakerinnen\.org\/.*profiles\/([0-9]+)/);
				if (match) {
					link.service = "speakerinnen";
					link.username = match[2];
				}
			break;
			case "tumblr.com":
				var match = link.url.match(/https?:\/\/(www\.)?(.*)\.tumblr\.com/);
				if (match) {
					link.service = "tumblr";
					link.username = match[2];
				}
			break;
			default:
				// debug("unknown service: %s", url.parse(link.url).host);
			break;
		}
		
		return link;
	
	});
	
	return links;
	
}

// autoresolve location
scraper.prototype.location = function(roomid, roomname){
	var self = this;
	var id = [self.data.event.id, "location", roomid].join("-");
	
	// check if this room exists
	if (!self.translate.locations.hasOwnProperty(id)) {
		// create room
		self.translate.locations[id] = (self.data.locations.push({
			"id": id,
			"type": "location",
			"event": self.data.event.id,
			"label_de": roomname,
			"label_en": roomname,
			"order_index": null, // FIXME: create order index
			"is_stage": (/stage /i.test(roomname))
		})-1);
		
		// add location to resolve table
		self.reverse.locations[id] = [];

	};

	return clone(self.data.locations[self.translate.locations[id]],false);
	
};

// autoresolve track
scraper.prototype.track = function(trackid, trackname){
	var self = this;
	var id = [self.data.event.id, "track", trackid].join("-");

	// check if this track exists
	if (!self.translate.tracks.hasOwnProperty(id)) {
		// create track
		
		if (config.tracks.hasOwnProperty(trackname)) {
			
			// get track from config
			self.translate.tracks[id] = (self.data.tracks.push({
				"id": id,
				"type": "track",
				"event": self.data.event.id,
				"slug": config.tracks[trackname].slug,
				"label_de": config.tracks[trackname].label_de,
				"label_en": config.tracks[trackname].label_en,
				"color": config.tracks[trackname].color
			})-1);
			
		} else {
			
			// create default track
			self.translate.tracks[id] = (self.data.tracks.push({
				"id": id,
				"type": "track",
				"event": self.data.event.id,
				"slug": trackname.toLowerCase().replace(/^\s+|\s+$/,'').replace(/[^a-z0-9]+/g,'-'),
				"label_de": trackname,
				"label_en": trackname,
				"color": [0,0,0,1]
			})-1);
			
			debug("unknown track: %s (%d): %j", trackname, trackid, self.data.tracks[self.translate.tracks[id]]);

		}
		
		// add track to resolve table
		self.reverse.tracks[id] = [];
		
	};

	return clone(self.data.tracks[self.translate.tracks[id]], false);
	
};

// autoresolve format
scraper.prototype.format = function(formatid, formatname){
	var self = this;
	var id = [self.data.event.id, "format", formatid].join("-");
	
	// check if this format exists
	if (!self.translate.formats.hasOwnProperty(id)) {
		// create format
		
		if (config.formats.hasOwnProperty(formatname)) {
			
			// get format from config
			self.translate.formats[id] = (self.data.formats.push({
				"id": id,
				"type": "format",
				"event": self.data.event.id,
				"slug": config.formats[formatname].slug,
				"label_de": config.formats[formatname].label_de,
				"label_en": config.formats[formatname].label_en
			})-1);
			
		} else {

			// create default format
			self.translate.formats[id] = (self.data.formats.push({
				"id": id,
				"type": "format",
				"event": self.data.event.id,
				"slug": formatname.toLowerCase().replace(/^\s+|\s+$/,'').replace(/[^a-z0-9]+/g,'-'),
				"label_de": formatname,
				"label_en": formatname
			})-1);
			
			debug("unknown format: %s (%d): %j", formatname, formatid, self.data.formats[self.translate.formats[id]]);

		}
		
		// add format to resolve table
		self.reverse.formats[id] = [];
		
	};

	return clone(self.data.formats[self.translate.formats[id]],false);
	
};

// autoresolve level
scraper.prototype.level = function(levelid, levelname){
	var self = this;
	var id = [self.data.event.id, "level", levelid].join("-");
	
	// check if this level exists
	if (!self.translate.levels.hasOwnProperty(id)) {
		// create level
		
		if (config.levels.hasOwnProperty(levelname)) {
			
			// get level from config
			self.translate.levels[id] = (self.data.levels.push({
				"id": id,
				"type": "level",
				"event": self.data.event.id,
				"slug": config.levels[levelname].slug,
				"label_de": config.levels[levelname].label_de,
				"label_en": config.levels[levelname].label_en
			})-1);
			
		} else {

			// create default level
			self.translate.levels[id] = (self.data.levels.push({
				"id": id,
				"type": "level",
				"event": self.data.event.id,
				"slug": levelname.toLowerCase().replace(/^\s+|\s+$/,'').replace(/[^a-z0-9]+/g,'-'),
				"label_de": levelname,
				"label_en": levelname
			})-1);
			
			debug("unknown level: %s (%d): %j", levelname, levelid, self.data.levels[self.translate.levels[id]]);

		}
		
		// add level to resolve table
		self.reverse.levels[id] = [];
		
	};

	return clone(self.data.levels[self.translate.levels[id]], false);
	
};

// autoresolve language
scraper.prototype.lang = function(langid, langname){

	var self = this;
	var id = [self.data.event.id, "lang", langid].join("-");
	
	// check if this lang exists
	if (!self.translate.langs.hasOwnProperty(id)) {

		// create lang
		if (config.langs.hasOwnProperty(langname)) {
			
			// get lang from config
			self.translate.langs[id] = (self.data.langs.push({
				"id": id,
				"type": "lang",
				"event": self.data.event.id,
				"slug": config.langs[langname].slug,
				"label_de": config.langs[langname].label_de,
				"label_en": config.langs[langname].label_en
			})-1);
						
		} else {

			// create default lang
			self.translate.langs[id] = (self.data.langs.push({
				"id": id,
				"type": "lang",
				"event": self.data.event.id,
				"slug": langname.toLowerCase().replace(/^\s+|\s+$/,'').replace(/[^a-z0-9]+/g,'-'),
				"label_de": langname,
				"label_en": langname
			})-1);
			
			debug("unknown lang: %s (%d): %j", langname, langid, self.data.langs[self.translate.langs[id]]);

		}
		
		// add lang to resolve table
		self.reverse.langs[id] = [];
		
	};

	return clone(self.data.langs[self.translate.langs[id]],false);
	
};

// autoresolve speakers (maybe it's overkill, but thats ok)
scraper.prototype.speakers = function(speakers){
	var self = this;
	if (!speakers || speakers === "") return [];
	return speakers.split(/,\s+/g).map(function(uid){
		return (self.translate.speakers.hasOwnProperty(uid)) ? self.data.speakers[self.translate.speakers[uid]] : null;
	}).filter(function(speaker){
		return (speaker !== null);
	}).map(function(speaker){
		return {
			id: speaker.id,
			name: speaker.name
		}
	});
};

// autoresolve speaker image
scraper.prototype.image = function(img){
	if (typeof img !== "object" || !img.hasOwnProperty("src") || !img.hasOwnProperty("alt") || typeof img.src !== "string" || img.src === "") return null;
	return img;
	// FIXME: cache image and add cache url
};

// parse data
scraper.prototype.parse = function(data, fn){
	var self = this;

	// build speaker data and add speaker id to translation data
	data.speakers.forEach(function(speaker){
		self.translate.speakers[speaker.uid.toString()] = (self.data.speakers.push({
			"type": "speaker",
			"event": self.data.event.id,
			"id": [self.data.event.id, "speaker", speaker.uid].join("-"),
			"name": [self.strprop(speaker, "gn"), self.strprop(speaker, "sn")].filter(function(v){ return (v !== null); }).join(" "),
			"photo": self.image(speaker.image),
			"url": self.strprop(speaker, "uri"),
			"biography": self.strprop(speaker, "description_short"),
			"organization": self.strprop(speaker, "org"),
			"organization_url": self.strprop(speaker, "org_uri"),
			"position": self.strprop(speaker, "position"),
			"sessions": [],
			"links": (self.strprop(speaker, "link_uris") ? self.links([speaker.link_uris, speaker.link_labels]) : [])
		})-1); // index is length minus one
				
		// FIXME: cache photos?
		
		// add speaker to resolve table
		self.reverse.speakers[[self.data.event.id, "speaker", speaker.uid].join("-")] = [];
		
	});

	data.sessions.forEach(function(session){

		var begin_t = moment(session.datetime.substr(0,10)+" "+session.start, "DD.MM.YYYY HH:mm");
		var end_t = moment(session.datetime.substr(0,10)+" "+session.end, "DD.MM.YYYY HH:mm");
		var id = [self.data.event.id, "session", session.nid].join("-");

		self.translate.sessions[id] = (self.data.sessions.push({
			"type": "session",
			"event": self.data.event.id,
			"id": id,
			"title": self.strprop(session, "title"),
			"abstract": self.strprop(session, "description_short"),
			"description": self.strprop(session, "description"),
			"url": self.strprop(session, "uri"),
			"begin": begin_t.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
			"end": end_t.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
			"duration": end_t.diff(begin_t,'seconds'),
			"day": self.day(begin_t),
			"location": self.location(parseInt(session.room_id,10), session.room),
			"track": self.track(parseInt(session.category_id,10), session.category),
			"format": self.format(parseInt(session.format_id,10), session.format),
			"level": self.level(parseInt(session.level_id,10), session.level),
			"lang":  self.lang(parseInt(session.language_id,10), session.language),
			"speakers": self.speakers(session.speaker_uids),
			"enclosures": [],
			"links": []
		})-1);
		
		if (session.video !== "") {
			var m = session.video.match(/^https?\:\/\/(www\.youtube\.com\/(watch\?v=|v\/)|youtu\.be\/)([a-zA-Z0-9\-\_]+)(\/|$|&)/i);
			if (m) {
				debug("found video: https://youtu.be/%s", m[3]);
				self.data.sessions[self.translate.sessions[id]].links.push({
		 			"thumbnail": "https://img.youtube.com/vi/" + m[3] + "/hqdefault.jpg",
		 			"title": self.data.sessions[self.translate.sessions[id]].title,
		 			"url": "https://www.youtube.com/v/" + m[3],
		 			"service": "youtube",
		 			"type": "recording"
				});
			}
		}
				
		self.reverse.locations[self.location(parseInt(session.room_id,10), session.room).id].push(id);
		self.reverse.tracks[self.track(parseInt(session.category_id,10), session.category).id].push(id);
		self.reverse.formats[self.format(parseInt(session.format_id,10), session.format).id].push(id);
		self.reverse.levels[self.level(parseInt(session.level_id,10), session.level).id].push(id);
		self.reverse.langs[self.lang(parseInt(session.language_id,10), session.language).id].push(id);
		
		self.speakers(session.speaker_uids).forEach(function(speaker){
			self.reverse.speakers[speaker.id].push(id);
		});
		
		// FIXME: ignore curator*? 
		
	});
	
	// reintegrate reverse stuff
	self.data.locations = self.data.locations.map(function(location){
		location.sessions = self.reverse.locations[location.id];
		return location;
	});

	self.data.tracks = self.data.tracks.map(function(track){
		track.sessions = self.reverse.tracks[track.id];
		return track;
	});
	
	self.data.formats = self.data.formats.map(function(format){
		format.sessions = self.reverse.formats[format.id];
		return format;
	});
	
	self.data.levels = self.data.levels.map(function(level){
		level.sessions = self.reverse.levels[level.id];
		return level;
	});
	
	self.data.langs = self.data.langs.map(function(lang){
		lang.sessions = self.reverse.langs[lang.id];
		return lang;
	});
	
	self.data.speakers = self.data.speakers.map(function(speaker){
		speaker.sessions = self.reverse.speakers[speaker.id];
		return speaker;
	});
	
	// FIXME: add map, pois, livestreams, 
	// FIXME: order locations
	
	fn(null, [self.data.event]
		.concat(self.data.langs)
		.concat(self.data.days)
		.concat(self.data.tracks)
		.concat(self.data.locations)
		.concat(self.data.levels)
		.concat(self.data.speakers)
		.concat(self.data.sessions)
		.concat(self.data.recordings)
		.concat(self.data.maps)
		.concat(self.data.pois)
	);
	return this;
	
};

if (!module.parent) {

	// parse command line arguments
	var argv = require("minimist")(process.argv.slice(2));

	// get instance of scraper
	scraper({
		imgcache: (argv.imgcache || null),
		outdir: (argv.out || null) 
	}, function(err, data, outdir){
		
		// FIXME: write to file or stdout
		
		if (outdir) {
			// write to file
			fs.writeFile(path.resolve(outdir, "data.json"), ((argv.pretty) ? JSON.stringify(data,null,"\t") : JSON.stringify(data)), function(err){
				if (err) return console.error("could not write data.json:", err);
				debug("data.json saved");
			});
		} else {
			// write to stdout
			process.stdout.write("[\n");
			data.forEach(function(record){
				process.stdout.write(JSON.stringify(record)+"\n");
			});
			process.stdout.write("]");
			debug("done");
		}
		
	});

}

module.exports = scraper;