# Open Confernce Data Scraper for #rp16

This is a standalone scrpaer to retrieve session and speaker data from [Re:publica 16](https://16.re-publica.de/) and convert it to Open Conference Data compliant JSON. 

## Install

```
npm install https://github.com/ocdata/ocd-scraper-rp16.git
```

## Usage

### Standalone

```
node ./scraper.js [--pretty] [--imgcache path/to/imgcache] [--out path/to/dir]
```
`--imgcache` specifies a directorys where speakers profile pictures are saved
`--pretty` makes pretty json files
`--out` specifies the directory where session data is written to; default is stdout


### As Module

``` javascript
var scraper = require("ocd-scraper-rp16");
scraper(function(err, data){
	if (err) return console.error(err);
	console.log(data);
});
```

## Data Format

The data comes in JSON format. The root object is an array of objects, which of each have an `id`, `type` and `event` property. Possible types are `event`, `lang`, `day`, `track`, `location`, `level`,  `speaker`,  `session` and `format`.

## Todo

* Cache Images
* Fix POIs
* Generate new Maps
* Fix Location Coordinates (Locations are not public yet)
* Fix Track Colors
* Add News Items
* Streams and Video Recordings
