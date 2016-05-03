var urlList = require('./urlList');

var getFetchUrl = function (location) {
    var selectString = "select * from html where url='https://www.google.com.tw/movies?hl=zh-TW&near=" + location + "' and xpath='//div[contains(@class,\"theater\")]'";
    var fetchUrl = urlList.YQL_ENDPOINT + '?q=' + encodeURIComponent(selectString) + '&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
    return fetchUrl;
};

var getObjectValue = function (object, path, defaultValue) {
    if (!object) {
        return defaultValue;
    }

    if (!path || !Array.isArray(path)) {
        return object;
    }

    var i;
    var pathLength = path.length;

    for (i = 0; object && i < pathLength; ++i) {
        object = object[path[i]];
    }

    if (object) {
        return object;
    } else {
        return defaultValue;
    }
};

var _parseDesc = function (data) {
    return {
        theaterName: getObjectValue(data, ['h2', 'a', 'content']),
        theaterAddress: getObjectValue(data, ['div', 'content'])
    };
};

var _parseMovieEntry = function (data) {
    var movies = data.div;
    if (!Array.isArray(movies)) {
        return null;
    }
    var movieName;
    var times;
    for (var i = 0; i < movies.length; ++i) {
        if (movies[i].class === 'name') {
            movieName = getObjectValue(movies[i], ['a', 'content'], null);
        } else if (movies[i].class === 'times') {
            times = movies[i].span;
        }
    }

    if (Array.isArray(times)) {
        times = times.filter(function (time) {
            return time.style === 'color:';
        });
    }

    return {
        movieName: movieName,
        times: [getObjectValue(times, ['0', 'content']), getObjectValue(times, ['1', 'content'])]
    };
};

var _parseShowtimes = function (data) {
    var showLeft = getObjectValue(data, ['div', '0', 'div']);
    var result = [];
    if (showLeft && showLeft.length > 0) {
        for (var i = 0; i < showLeft.length; ++i) {
            result.push(_parseMovieEntry(showLeft[i]));
        }
    }
    return result;
};

/*
 * output format: 
 * {
 *     "desc": {data...},
 *     "showtimes": {data...}  
 * }
 */
var _parseTheater = function (theater) {
    var detailsArray = theater.div;
    var details = {};
    if (!detailsArray) {
        return null;
    }
    for (var i = 0; i < detailsArray.length; ++i) {
        var type = detailsArray[i].class;
        details[type] = detailsArray[i];
    }

    return {
        description: _parseDesc(details['desc']),
        showtimes: _parseShowtimes(details['showtimes'])
    };
};

var parseData = function (data) {
    var result = [];
    if (!data || !data.query || !data.query.results) {
        return {
            error: 'invalid data'
        };
    }
    var theaters = data.query.results.div;
    if (!Array.isArray(theaters)) {
        return {
            error: 'invalid data'
        };
    }
    theaters = theaters.filter(function (theater) {
        return theater.class === 'theater';
    });
    for (var i = 0; i < theaters.length; ++i) {
        result.push(_parseTheater(theaters[i]));
    }
    return result;
};

var urlWithParams = function (url, paramsObject) {
    var paramsArray = [];
    for (var key in paramsObject) {
        if (paramsObject.hasOwnProperty(key)) {
            paramsArray.push(key + '=' + paramsObject[key]);
        }
    }
    return url + '?' + paramsArray.join('&');
};

module.exports = {
    getFetchUrl: getFetchUrl,
    parseData: parseData,
    getObjectValue: getObjectValue,
    urlWithParams: urlWithParams,
};