// alexa-cookbook sample code

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// You can copy and paste the entire file contents as the code for a new Lambda function,
//  or copy & paste section #3, the helper function, to the bottom of your existing Lambda code.


// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

// 2. Skill Code =======================================================================================================


var Alexa = require('alexa-sdk');

var APP_ID = "amzn1.ask.skill.8ec286b9-c216-463d-8e31-eee2135e9cea"; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var SKILL_NAME = 'Close Approaches';

var moment = require('moment');
var currDate = moment().utcOffset('-0500').format("YYYY-MM-D")
var dateRangeURI = "start_date="+currDate+"&end_date="+currDate

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    // alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('MyIntent');
    },

    'MyIntent': function () {

        httpsGet((myResult) => {
                // console.log("sent     : " + myRequest);
                console.log(Object.keys(myResult))
                console.log("received : " + myResult.element_count);

                // console.log("received : " + JSON.stringify(myResult));

                if(myResult.element_count === 1){
                  this.emit(':tell', 'As of the last update from the Jet    Propulsion Lab Near Earth Object observatory, there is ' + myResult.element_count + " near earth object coming towards the planet Earth. It's name is " + myResult.near_earth_objects[currDate][0].name.replace(/[{()}]/g, '')
                  );

                } else {

                  var nearestNEO = myResult.near_earth_objects[currDate][0].close_approach_data[0].miss_distance.miles

                  var nearestNEOIdx = 0

                  for(var eleIdx = 0; eleIdx < myResult.element_count; eleIdx++){
                    currDist = myResult.near_earth_objects[currDate][eleIdx].close_approach_data[0].miss_distance.miles
                    if( currDist < nearestNEO){
                      nearestNEO = currDist
                      nearestNEOIdx = eleIdx
                    }
                  }

                  this.emit(':tell', 'As of the last update from the Jet Propulsion Lab Near Earth Object observatory, there are ' + myResult.element_count + " near earth objects coming towards the planet Earth. The closest one, " + myResult.near_earth_objects[currDate][nearestNEOIdx].name.replace(/[{()}]/g, '') +" will miss earth by about " + Math.round(nearestNEO / 1000000 ) * 1000000 + " miles.");
                }
            }
        );
    }
};


//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================


var https = require('https');
// https is a default part of Node.JS.  Read the developer doc:  https://nodejs.org/api/https.html
// try other APIs such as the current bitcoin price : https://btc-e.com/api/2/btc_usd/ticker  returns ticker.last

function httpsGet(callback) {

    // GET is a web service request that is fully defined by a URL string
    // Try GET in your browser:
    // https://cp6gckjt97.execute-api.us-east-1.amazonaws.com/prod/stateresource?usstate=New%20Jersey
    // This is the nasa Near Earth Object api and apiKey

    // https://api.nasa.gov/neo/rest/v1/feed?start_date=2017-04-11&end_date=2017-4-11&api_key=FYs2cMp5jKr8sNz2VzImCevDaYq1i4ihBCbqYixK

    //Begin test code to source date.

    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'api.nasa.gov',
        port: 443,
        path: '/neo/rest/v1/feed?'+dateRangeURI+"&api_key=FYs2cMp5jKr8sNz2VzImCevDaYq1i4ihBCbqYixK",
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data

            var pop = JSON.parse(returnData);

            if(!callback){
              console.log("testing locally, no need to call back and emit")
            } else {
              callback(pop);  // this will execute whatever function the caller defined, with one argument
            }

        });

    });

    req.end();

}

// httpsGet(handlers.MyIntent())
