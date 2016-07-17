/**
 * Created by ermalyk on 7/9/2016.
 */
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var MAX_PAGES_TO_VISIT = 10;

var START_URL = "https://www.youtube.com/watch?v=_rZCuitamGI";
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

var Song = function(url, name, duration){
    this.url = url;
    this.name = name;
    this.duration = duration;
};

var slideBar = [new Song('https://www.youtube.com/watch?v=_rZCuitamGI', 'ARIA', '5:00')];
var numPagesVisited = 0;
var playList = [];
playList.push(new Song('','',''));

crawl();

function allSongs() {
    for(var i=1;i<playList.length;i++) {

        console.log('===============song '+ i +'==================');
        console.log(playList[i].url);
        console.log('%s', playList[i].name);
        console.log(playList[i].duration);
        console.log('===============end==================');
    }
}

function crawl() {
    if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
        allSongs();

        console.log("Reached max limit of number of pages to visit.");
        return;
    }

    var nextSong = slideBar.pop();
    if (nextSong in playList) {
        for(var i=0;i<slideBar.length;i++) {
            var song = slideBar.pop();

            if(song.url == nextSong.url) {
                continue;
            }

            nextSong = slideBar[i];

            break;
        }
    }

    playList.push(nextSong);

    visitSong(nextSong, crawl);

}
function visitSong(song, callback) {
    numPagesVisited++;

    request(song.url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        //console.log("Status code: " + response.statusCode);
        if(response.statusCode !== 200) {
            callback();
            return;
        }
        // Parse the document body
        var $ = cheerio.load(body);
        collectInternalLinks($);
        callback();
    });

}

function collectInternalLinks($) {
    var result = $('.related-list-item');
    var s = $('a.content-link[title]');
    //var result = $('.watch7-sidebar-modules');
    slideBar.length = 0;
    slideBar.push(new Song(baseUrl + s.attr('href'), s.find('span.title').html(), s.find('span.accessible-description').html()));

    for(var i=0;i<result.length; i++) {
        var baseEl = $(result[i]).find('a');
        slideBar.push(new Song(baseUrl + baseEl.attr('href'), baseEl.find('span.title').html(), baseEl.find('span.accessible-description').html()));


    }
    //
    //console.log('===============start '+ numPagesVisited +'==================');
    //console.log(slideBar[0].url);
    //console.log(slideBar[0].name);
    //console.log(slideBar[0].duration);
    //console.log('===============end==================');
    //var song = $('a.content-link[title]');
    //console.log('===============start==================');
    //console.log($('a.content-link[title]'));
    //console.log('===============end==================');
    //songsToVisit.push(new Song(baseUrl + song.attr('href'), song.attr('span.title'), song.find('span.accessible-description').text()));


}
