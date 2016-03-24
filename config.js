module.exports = {

	// data feeds
	newsfeed_url: "https://re-publica.de/news/feed.xml",
	speaker_url: "https://re-publica.de/event/6553/json/speakers",
	session_url: "https://re-publica.de/event/6553/json/sessions",


	// hours the event-day is shifted from local time
	// to accomodate for after-midnight-sessions
	dayend: 6,

	// main event data
	event: {
		id: "rp16",
		type: "event",
		title: "re:publica 16",
		slogan: "ten is net",
		begin: "2016-05-02",
		end: "2016-05-04",
		locations: [{
			label: "Station Berlin",
			coords: [52.49814,13.374538]
		}],
		url: "https://16.re-publica.de/",
		last_modified: (Date.now()/1000)
	},

	// preconfigured formats
	formats: {
		"Diskussion": {
			slug: "discussion",
			label_de: "Diskussion",
			label_en: "Discussion"
		},
		"Vortrag": {
			slug: "talk",
			label_de: "Vortrag",
			label_en: "Talk"
		},
		"Workshop": {
			slug: "workshop",
			label_de: "Workshop",
			label_en: "Workshop"
		},
		"Aktion": {
			slug: "action",
			label_de: "Aktion",
			label_en: "Action"
		}
	},


	// preconfigured levels
	levels: {
		"Beginner": {
			slug: "beginner",
			label_de: "Anfänger",
			label_en: "Beginner"
		},
		"Fortgeschrittene": {
			slug: "intermediate",
			label_de: "Fortgeschrittene",
			label_en: "Intermediate"
		},
		"Experten": {
			slug: "advanced",
			label_de: "Experten",
			label_en: "Advanced"
		}
	},

	// preconfigured languages
	langs: {
		"Englisch": {
			slug: "en",
			label_de: "Englisch",
			label_en: "English"
		},
		"Deutsch": {
			slug: "de",
			label_de: "Deutsch",
			label_en: "German"
		},
		"Deutsch/Englisch": {
			slug: "de+en",
			label_de: "Deutsch/Englisch",
			label_en: "German/English"
		}
	},


	// preconfigured track data
	tracks: {
		"Business & Innovation": {
			slug: "business-innovation",
			label_de: "Business & Innovation",
			label_en: "Business & Innovation",
			color: [196.0, 55.0, 8.0, 1.0],
			wid: 6
		},
		"Politics & Society": {
			slug: "politics-society",
			label_de: "Politik & Gesellschaft",
			label_en: "Politics & Society",
			color: [112.0, 77.0, 133.0, 1.0],
			wid: 8
		},
		"Science & Technology": {
			slug: "science-technology",
			label_de: "Wissenschaft & Technik",
			label_en: "Science & Technology",
			color: [164.0, 148.0, 1.0, 1.0],
			wid: 7
		},
		"Research & Education": {
			slug: "research-education",
			label_de: "Forschung & Bildung",
			label_en: "Research & Education",
			color: [102.0, 102.0, 204.0, 1.0],
			wid: 9
		},
		"Culture": {
			slug: "culture",
			label_de: "Kultur & Kunst",
			label_en: "Culture & Arts",
			color: [195.0, 118.0, 2.0, 1.0],
			wid: 1
		},
		"Health": {
			slug: "health",
			label_de: "Health",
			label_en: "Health",
			color: [102.0, 102.0, 204.0, 1.0],
			wid: 154
		},
		"Fashiontech": {
			slug: "fashiontech",
			label_de: "Fashiontech",
			label_en: "Fashiontech",
			color: [193.0, 117.0, 28.0, 1.0],
			wid: 151
		},
		"Media Convention": {
			slug: "media-Convention",
			label_de: "Media Convention",
			label_en: "Media Convention",
			color: [0.0, 0.0, 0.0, 1.0],
			wid: 142
		},
		"re:publica": {
			slug: "re-publica",
			label_de: "re:publica",
			label_en: "re:publica",
			color: [99.0, 157.0, 36.0, 1.0],
			wid: 31
		},
		
		// tracks not currently on the site:
		"City Of The Future": {
			slug: "city-of-the-future",
			label_de: "City Of The Future",
			label_en: "City Of The Future",
			color: [102.0, 102.0, 102.0, 1.0]
		},
		"GIG": {
			slug: "gig",
			label_de: "Global Innovation Gathering",
			label_en: "Global Innovation Gathering",
			color: [193.0, 117.0, 28.0, 1.0]
		},
		"Media": {
			slug: "media",
			label_de: "Medien",
			label_en: "Media",
			color: [11.0, 87.0, 127.0, 1.0]
		},
		"re:cord Musicday": {
			slug: "re-cord-musicday",
			label_de: "re:cord Musicday",
			label_en: "re:cord Musicday",
			color: [51.0, 204.0, 102.0, 1.0]
		},
		"re:health": {
			slug: "re-health",
			label_de: "re:health",
			label_en: "re:health",
			color: [114.0, 192.0, 14.0, 1.0]
		},
		"re:think Mobility": {
			slug: "re-think-mobility",
			label_de: "re:think Mobility",
			label_en: "re:think Mobility",
			color: [102.0, 156.0, 44.0, 1.0]
		},
		"Other": {
			slug: "other",
			label_de: "Other",
			label_en: "Other",
			color: [101.0, 156.0, 45.0, 1.0]
		}
	},
	
	// maps
	maps: [{
		"label_de": "Station Berlin",
		"label_en": "Station Berlin",
		"floor_label_de": "Station Berlin",
		"floor_label_en": "Station Berlin",
		"is_outdoor": true,
		"is_indoor": true,
		"floor": 0,
		"order_index": 0,
		"area": {
			"width": 7872.0, 
			"height": 2814.0
		},
		"tiles": {
			"base_url": "http://data.conference.bits.io/maps/rp16/station-berlin",
			"large_image_url": "http://data.conference.bits.io/maps/rp16/station-berlin/mini.png",
			"tile_size": 512,
			"tile_file_extension": "png",
			"size": {
				"width": 7872,
				"height": 2814
			}
		},
	}],
	
	// points of interest:
	pois: [{
		slug: "stage1",
		floor: 0,
		location_id: "rp16-location-5591",
		coords: [1536,918],
		label_de: "STG-1",
		label_en: "STG-1",
		category: "session-location"
	},{
		slug: "stage2",
		floor: 0,
		location_id: "rp16-location-5929",
		coords: [342,454],
		label_de: "STG-2",
		label_en: "STG-2",
		category: "session-location"
	},{
		slug: "stage3",
		floor: 0,
		location_id: "rp16-location-5930",
		coords: [730,1150],
		label_de: "STG-3",
		label_en: "STG-3",
		category: "session-location"
	},{
		slug: "stage4",
		floor: 0,
		location_id: "rp16-location-5931",
		coords: [2174,1724],
		label_de: "STG-4",
		label_en: "STG-4",
		category: "session-location"
	},{
		slug: "stage5",
		floor: 0,
		location_id: "rp16-location-5932",
		coords: [3330,1766],
		label_de: "STG-5",
		label_en: "STG-5",
		category: "session-location"
	},{
		slug: "stage6",
		floor: 0,
		location_id: "rp16-location-5933",
		coords: [3674,2470],
		label_de: "STG-6",
		label_en: "STG-6",
		category: "session-location"
	},{
		slug: "stage7",
		floor: 0,
		location_id: "rp16-location-5934",
		coords: [5882,2572],
		label_de: "STG-7",
		label_en: "STG-7",
		category: "session-location"
	},{
		slug: "stage8",
		floor: 0,
		location_id: "rp16-location-5935",
		coords: [4564,354],
		label_de: "STG-8",
		label_en: "STG-8",
		category: "session-location"
	},{
		slug: "stage9",
		floor: 0,
		location_id: "rp16-location-5936",
		coords: [3938,300],
		label_de: "STG-9",
		label_en: "STG-9",
		category: "session-location"
	},{
		slug: "stage10",
		floor: 0,
		location_id: "rp16-location-5937",
		coords: [3518,306],
		label_de: "STG-10",
		label_en: "STG-10",
		category: "session-location"
	},{
		slug: "stage11",
		floor: 0,
		location_id: "rp16-location-5934",
		coords: [2892,318],
		label_de: "STG-11",
		label_en: "STG-11",
		category: "session-location"
	},{
		slug: "staget",
		floor: 0,
		location_id: "rp16-location-5934",
		coords: [6256,1768],
		label_de: "STG-T",
		label_en: "STG-T",
		category: "session-location"
	},{
		slug: "stagej",
		floor: 0,
		location_id: "rp16-location-5934",
		coords: [6300,2186],
		label_de: "STG-J",
		label_en: "STG-J",
		category: "session-location"
	},{
		slug: "viparea",
		floor: 0,
		location_id: null,
		coords: [5430,1850],
		label_de: "VIP Area",
		label_en: "VIP Area",
		category: "other"
	},{
		slug: "entry0",
		floor: 0,
		location_id: null,
		coords: [7442,566],
		label_de: "Entry",
		label_en: "Entry",
		category: "other"
	},{
		slug: "store",
		floor: 0,
		location_id: "rp16-location-6289",
		coords: [7014,556],
		label_de: "Store",
		label_en: "Store",
		category: "shopping"
	},{
		slug: "registration",
		floor: 0,
		location_id: null,
		coords: [7234,412],
		label_de: "Registration",
		label_en: "Registration",
		category: "service"
	},{
		slug: "jazzbar",
		floor: 0,
		location_id: null,
		coords: [6898,976],
		label_de: "Jazzbar",
		label_en: "Jazzbar",
		category: "entertainment"
	},{
		slug: "backyard",
		floor: 0,
		location_id: null,
		coords: [6650,470],
		label_de: "Backyard",
		label_en: "Backyard",
		category: "community"
	},{
		slug: "refill",
		floor: 0,
		location_id: null,
		coords: [6004,684],
		label_de: "re:fill Bar",
		label_en: "re:fill Bar",
		category: "entertainment"
	},{
		slug: "courtyard",
		floor: 0,
		location_id: null,
		coords: [5568,1266],
		label_de: "Courtyard",
		label_en: "Courtyard",
		category: "community"
	},{
		slug: "reception",
		floor: 0,
		location_id: null,
		coords: [5148,1498],
		label_de: "re:ception",
		label_en: "re:ception",
		category: "service"
	},{
		slug: "entry1",
		floor: 0,
		location_id: null,
		coords: [7436,1174],
		label_de: "Entry",
		label_en: "Entry",
		category: "other"
	},{
		slug: "patio",
		floor: 0,
		location_id: null,
		coords: [5472,2372],
		label_de: "Patio",
		label_en: "Patio",
		category: "other"
	},{
		slug: "miz",
		floor: 0,
		location_id: "rp16-location-6145",
		coords: [3737,1121],
		label_de: "MIZ",
		label_en: "MIZ",
		category: "workshop-location"
	},{
		slug: "makerspace",
		floor: 0,
		location_id: "rp16-location-6144",
		coords: [4140,1043],
		label_de: "Makerspace",
		label_en: "Makerspace",
		category: "workshop-location"
	}]
}
