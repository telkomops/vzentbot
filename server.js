var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var apiai = require('apiai');
var nconf = require('nconf');
var uuid = require('node-uuid');

nconf.file('./config/config.json');
var app = apiai(nconf.get('apiai:clientid'));

//=========================================================
// Bot Setup
//=========================================================


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
    console.log('NODE_ENV: ' + nconf.get('NODE_ENV'));
    console.log('Microsoft_AppID: ' + nconf.get('msbot:Microsoft_AppID'));
    console.log('apiai: ' + nconf.get('apiai:clientid'));
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: nconf.get('msbot:Microsoft_AppID'),
    appPassword: nconf.get('msbot:Microsoft_AppPassword')
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    var options = {sessionId: '9dbb0570-9a8b-11e6-a1e7-afc8eaec72d6'}

    var request = app.textRequest(session.message.text, options);
    request.on('response', function (response) {
        var intent = response.result.action;
        console.log(JSON.stringify(response));
	var Finished_Status=response.result.actionIncomplete;
	 console.log("Finished_Status "+ Finished_Status);
	
	if(Finished_Status == true)
	{
        	session.send(response.result.fulfillment.speech);
	}
	else //if(Finished_Status =="false")
	{
		    console.log("-----------INTENT SELECTION-----------");
		    var straction =response.result.action;
		    console.log("Selected_intentName : "+ straction);
		    
           	    switch (straction) {
				    
			 case "getStarted":
			    welcomeMsg(session);
			   break;
			 case "recordnew":
			    var Record = require('./modules/record.js').Record;
			    Record.doRecord(session, response, builder);

			  /*  case "recordnew":
			    var Record = require('./modules/record.js').Record;
			    Record.doRecord(session, response, builder);				    
			    break; */
			case "CategoryList":
			      CategoryList(response,session);
			      break;
			case "LinkOptions":
			    LinkOptionsNew(response,session);
			     break;
			case "MoreOptions":
			   session.send(response.result.fulfillment.speech);
			    break;
			case "recordnew":
			      RecordScenario (response,session); 
			      break;    
			case "Billing":
			  //  var billing = require('./modules/MoreOptions.js').Billing;				    				   
			     testmethod(session);
			    break;
			case "stblist":
 			    STBList(response,function (str){ STBListCallBack(str,session)}); 
			    break;
			case "upsell":

			    break;
			case "upgradeDVR":

			    break;
			case "stgexternalcall":

			    break;
			case "Trending":

			    break;
			case "recommendation":
 			    recommendTVNew('whatshot',function (str) {recommendTVNew1(str,session)}); 
			    break;
			case "channelsearch":
		   	   ChnlSearch(response,function (str){ ChnlSearchCallback(str,session)}); 
			   break;
			case "programSearch":
  			    PgmSearch(response,function (str){ PgmSearchCallback(str,session)});
			    break;
			case "getStarted":

			    getStarted.dogetStarted(req, res);
			default:

			 }
    }

				
    });
    request.on('error', function (error) {
        console.log(error);
    });

    request.end()


});


function welcomeMsg(usersession)
{
    console.log("inside welcomeMsg");
    var respobj= {
  "facebook": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Want to know what’s on tonight? When your favorite sports team is playing? What time your favorite show is coming on? I can answer almost anything, so try me! Before we get started—let’s take a few minutes to get me linked to your Verizon account, this way I can send you personalized recommendations, alerts.",
        "buttons": [
          {
            "type": "postback",
            "title": "Link Account",
            "payload": "Link Account"
          },
          {
            "type": "postback",
            "title": "Maybe later",
            "payload": "Main Menu"
          }
        ]
      }
    }
  }
};
	 console.log(JSON.stringify(respobj)); 
	var msg = new builder.Message(usersession).sourceEvent(respobj);              
          usersession.send(msg);
}

function CategoryList(apireq,usersession) {
	
	var pgNo = apireq.result.parameters.PageNo;
	var categlist={}
	
	switch(pgNo)
	{
		case '1':
			categlist={"facebook":
			{ "text":"Pick a category", 
			 "quick_replies":[ 
			//    "content_type":"text", "title":"Red", "payload":"red"
			    { "content_type": "text", "title":"Children & Family", "payload":"show Kids movies" }, 
			    { "content_type": "text", "title":"Action & Adventure", "payload":"show Action movies" }, 
			    { "content_type": "text", "title":"Documentary", "payload":"show Documentary movies" }, 
			    { "content_type": "text", "title":"Mystery", "payload":"show Mystery movies" },
			    { "content_type": "text", "title":"More Categories ", "payload":"show categories list pageno: 2" }
			 ] }};
			break;
		default :
		categlist={"facebook":
			{ "text":"I can also sort my recommendations for you by genre. Type or tap below", 
			 "quick_replies":[ 
			    { "content_type": "text", "payload":"Show Comedy movies", "title":"Comedy" }, 
			    { "content_type": "text", "payload":"Show Drama movies", "title":"Drama" }, 
			    { "content_type": "text", "payload":"Show Sports program" , "title":"Sports"}, 
			    { "content_type": "text", "payload":"show Sci-Fi movies" , "title":"Sci-Fi"},
			    { "content_type": "text", "payload":"show categories list pageno: 1" , "title":"More Categories "}
			 ] }};
			break;
		}
	
	var msg = new builder.Message(usersession).sourceEvent(categlist);              
        usersession.send(msg);
	
} 

function PgmSearch(apireq,callback) { 
         var strProgram =  apireq.result.parameters.Programs;
	 var strGenre =  apireq.result.parameters.Genre;
	 var strdate =  apireq.result.parameters.date;
	 var strChannelName =  apireq.result.parameters.Channel;
	 var strRegionId = "92377";
	 console.log("strProgram " + strProgram + "strGenre " + strGenre + "strdate " +strdate);
	
        var headersInfo = { "Content-Type": "application/json" };
	
	var args = {
		"headers": headersInfo,
		"json": {Flow: 'TroubleShooting Flows\\Test\\APIChatBot.xml',
			 Request: {ThisValue: 'EnhProgramSearch', 
				   BotstrTitleValue:strProgram, 
				   BotdtAirStartDateTime : strdate,
				   BotstrGenreRootId : strGenre,
				   BotstrStationCallSign:strChannelName,
				   BotstrFIOSRegionID : strRegionId
				  } 
			}
		};
	
	 console.log("args " + args);
	
    request.post("https://www.verizon.com/foryourhome/vzrepair/flowengine/restapi.ashx", args,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
             
                 console.log("body " + body);
                callback(body);
            }
            else
            	console.log('error: ' + error + ' body: ' + body);
        }
    );
 } 
  
function PgmSearchCallback(apiresp,usersession) {
    var objToJson = {};
    objToJson = apiresp;
	var subflow = objToJson[0].Inputs.newTemp.Section.Inputs.Response;
	 console.log("subflow " + JSON.stringify(subflow));
	var msg = new builder.Message(usersession).sourceEvent(subflow);              
        usersession.send(msg);
} 

function ChnlSearch(apireq,callback) { 
	console.log("ChnlSearch called " );
	
      var strChannelName =  apireq.result.parameters.Channel.toUpperCase();
	
	  console.log("strChannelName " + strChannelName);
        var headersInfo = { "Content-Type": "application/json" };
	var args = {
		"headers": headersInfo,
		"json": {Flow: 'TroubleShooting Flows\\Test\\APIChatBot.xml',
			 Request: {ThisValue: 'ChannelSearch',BotstrStationCallSign:strChannelName} 
			}
		
	};
  console.log("json " + String(args));
	
    request.post("https://www.verizon.com/foryourhome/vzrepair/flowengine/restapi.ashx", args,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
             
                 console.log("body " + body);
                callback(body);
            }
            else
            	console.log('error: ' + error + ' body: ' + body);
        }
    );
 } 
  
function ChnlSearchCallback(apiresp,usersession) {
    var objToJson = {};
    objToJson = apiresp;
	var chposition = objToJson[0].Inputs.newTemp.Section.Inputs.Response;
	
	console.log("chposition :" + chposition)
	usersession.send ("You can watch it on channel # " + chposition);
} 

function recommendTVNew(pgmtype,callback) { 
       	console.log('inside external call ');
        var headersInfo = { "Content-Type": "application/json" };
	var args = {
		"headers": headersInfo,
		"json": {
			Flow: 'TroubleShooting Flows\\Test\\APIChatBot.xml',
			Request: {
				ThisValue: pgmtype, BotstrVCN:''
			}
		}
	};

    request.post("https://www.verizon.com/foryourhome/vzrepair/flowengine/restapi.ashx", args,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
             
                 console.log("body " + body);
                callback(body);
            }
            else
            	console.log('error: ' + error + ' body: ' + body);
        }
    );
 } 
  
function recommendTVNew1(apiresp,usersession) {
    var objToJson = {};
    objToJson = apiresp;
	var subflow = objToJson[0].Inputs.newTemp.Section.Inputs.Response;
	
	 console.log("subflow " + JSON.stringify(subflow));
	
	var msg = new builder.Message(usersession).sourceEvent(subflow);              
        usersession.send(msg);
} 

function LinkOptionsNew(apireq,usersession)
{
    console.log('Calling from  link options:') ;
	
    var strRegionId =  apireq.result.parameters.RegionId;
    console.log('strRegionId:' + strRegionId) ;
	var respobj={};
	if (strRegionId != undefined  && strRegionId !='')
	{
		respobj= {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":"Are you looking for something to watch, or do you want to see more options? Type or tap below.","buttons":[{"type":"postback","title":"What's on tonight?","payload":"On Later"},{"type":"postback","title":"More Options","payload":"More Options"}]}}}};
	}
	else
	{
		var struserid = ''; 
		for (var i = 0, len = apireq.result.contexts.length; i < len; i++) 
		{
				if (apireq.result.contexts[i].name == "sessionuserid")
				{
					 struserid = apireq.result.contexts[i].parameters.Userid;
					console.log("original userid " + ": " + struserid);
				}
		} 

		if (struserid == '' || struserid == undefined) struserid='lt6sth2'; //hardcoding if its empty	

		respobj= {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":"Congrats, we got your details. Tap Continue to proceed.","buttons":[{"type":"postback","title":"Continue","payload":"Userid : " + struserid + "   Regionid : 92377"}]}}}};
	}

    var msg = new builder.Message(usersession).sourceEvent(respobj);              
    usersession.send(msg);
}

function RecordScenario (apiresp,usersession)
{
	var channel = apiresp.result.parameters.Channel.toUpperCase();
	var program = apiresp.result.parameters.Programs.toUpperCase();
	var time = apiresp.result.parameters.timeofpgm;
	var dateofrecord = apiresp.result.parameters.date;
	var SelectedSTB = apiresp.result.parameters.SelectedSTB;
	console.log("SelectedSTB : " + SelectedSTB + " channel : " + channel + " dateofrecord :" + dateofrecord + " time :" + time);
		
		if (time == "") 
			{ PgmSearch(apiresp,function (str){ PgmSearchCallback(str,usersession)});}
		else if (SelectedSTB == "" || SelectedSTB == undefined) 
			{ STBList(apiresp,function (str){ STBListCallBack(str,usersession)}); }
		else if (channel == 'HBO') //not subscribed case
			{
			 var respobj = {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":" Sorry you are not subscribed to " + channel +". Would you like to subscribe " + channel + " ?","buttons":[{"type":"postback","title":"Subscribe","payload":"Subscribe"},{"type":"postback","title":"No, I'll do it later ","payload":"Main Menu"}]}}}};	
			 var msg = new builder.Message(usersession).sourceEvent(respobj);              
			  usersession.send(msg);
			}
		else if (channel == 'CBS')  //DVR full case
			{
			   var respobj= {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":" Sorry your DVR storage is full.  Would you like to upgrade your DVR ?","buttons":[{"type":"postback","title":"Upgrade my DVR","payload":"Upgrade my DVR"},{"type":"postback","title":"No, I'll do it later ","payload":"Main Menu"}]}}}};
			   var msg = new builder.Message(usersession).sourceEvent(respobj);              
			   usersession.send(msg);
			}
		else 
			{
				console.log(" Channel: " + apiresp.result.parameters.Channel +" Programs: " + apiresp.result.parameters.Programs +" SelectedSTB: " + apiresp.result.parameters.SelectedSTB +" Duration: " + apiresp.result.parameters.Duration +" FiosId: " + apiresp.result.parameters.FiosId +" RegionId: " + apiresp.result.parameters.RegionId +" STBModel: " + apiresp.result.parameters.STBModel +" StationId: " + apiresp.result.parameters.StationId +" date: " + apiresp.result.parameters.date +" timeofpgm: " + apiresp.result.parameters.timeofpgm );
				DVRRecord(apiresp,function (str){ DVRRecordCallback(str,usersession)});
			}  
}


function STBList(apireq,callback) { 
       	console.log('inside external call '+ apireq.contexts);
	var struserid = ''; 
	for (var i = 0, len = apireq.result.contexts.length; i < len; i++) {
		if (apireq.result.contexts[i].name == "sessionuserid") {

			 struserid = apireq.result.contexts[i].parameters.Userid;
			console.log("original userid " + ": " + struserid);
		}
	} 
	
	if (struserid == '' || struserid == undefined) struserid='lt6sth2'; //hardcoding if its empty
	
		console.log('struserid '+ struserid);
        var headersInfo = { "Content-Type": "application/json" };
	var args = {
		"headers": headersInfo,
		"json": {Flow: 'TroubleShooting Flows\\Test\\APIChatBot.xml',
			 Request: {ThisValue: 'STBList',Userid:struserid} 
			}
		
	};

    request.post("https://www.verizon.com/foryourhome/vzrepair/flowengine/restapi.ashx", args,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
             
                 console.log("body " + body);
                callback(body);
            }
            else
            	console.log('error: ' + error + ' body: ' + body);
        }
    );
 } 
  
function STBListCallBack(apiresp,usersession) {
    var objToJson = {};
    objToJson = apiresp;
	var subflow = objToJson[0].Inputs.newTemp.Section.Inputs.Response;
   	var msg = new builder.Message(usersession).sourceEvent(subflow);              
    	usersession.send(msg);
} 

function DVRRecord(apireq,callback) { 
	
	var strUserid = ''; 
	for (var i = 0, len = apireq.result.contexts.length; i < len; i++) {
		if (apireq.result.contexts[i].name == "sessionuserid") {

			 strUserid = apireq.result.contexts[i].parameters.Userid;
			console.log("original userid " + ": " + strUserid);
		}
	} 
	if (strUserid == '' || strUserid == undefined) strUserid='lt6sth2'; //hardcoding if its empty
		
         var strProgram =  apireq.result.parameters.Programs;
	 var strChannelName =  apireq.result.parameters.Channel;
	 var strGenre =  apireq.result.parameters.Genre;

	var strFiosId = apireq.result.parameters.FiosId;
	var strStationId =apireq.result.parameters.StationId  ;
	
	var strAirDate =apireq.result.parameters.date  ;
	var strAirTime =apireq.result.parameters.timeofpgm  ;
	var strDuration =apireq.result.parameters.Duration  ;
	
	var strRegionId =apireq.result.parameters.RegionId;
	var strSTBModel =apireq.result.parameters.STBModel  ;
	var strSTBId =apireq.result.parameters.SelectedSTB  ;
	
	var strVhoId =apireq.result.parameters.VhoId  ;
	var strProviderId =apireq.result.parameters.ProviderId  ;
	
	
	 console.log(" strUserid " + strUserid + "Recording strProgram " + strProgram + " strGenre " + strGenre + " strdate " +strAirDate + " strFiosId " +strFiosId + " strStationId " +strStationId  +" strAirDate " + strAirDate + " strAirTime " + strAirTime+ " strSTBId " +strSTBId + " strSTBModel " +strSTBModel+" strRegionId " +strRegionId+ " strDuration " +strDuration );
	
        var headersInfo = { "Content-Type": "application/json" };
	
	var args = {
		"headers": headersInfo,
		"json": {Flow: 'TroubleShooting Flows\\Test\\APIChatBot.xml',
			 Request: {ThisValue: 'DVRSchedule', 
				   Userid : strUserid,
				   BotStbId:strSTBId, 
				   BotDeviceModel : strSTBModel,
				   BotstrFIOSRegionID : '91629',
				   BotstrFIOSServiceId : strFiosId,
				   BotStationId : strStationId,
				   BotAirDate : strAirDate,
				   BotAirTime : strAirTime,
				   BotDuration : strDuration,
				   BotVhoId : strVhoId,
				   BotProviderId : strProviderId
				   } 
			}
		};
	
	 console.log("args " + JSON.stringify(args));
	
    request.post("https://www.verizon.com/foryourhome/vzrepair/flowengine/restapi.ashx", args,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
             
                 console.log("body " + JSON.stringify(body));
                callback(body);
            }
            else
            	console.log('error: ' + error + ' body: ' + body);
        }
    );
 } 

function DVRRecordCallback(apiresp) 
{
     var objToJson = {};
     objToJson = apiresp;
	try{
		var subflow = objToJson[0].Inputs.newTemp.Section.Inputs.Response;
		console.log(JSON.stringify(subflow));
		var respobj={};
		if (subflow !=null )
		{
			if (subflow.facebook.result.msg =="success" )
			{
				respobj = {"facebook":{"attachment":{"type":"template","payload":{"template_type":"button","text":"Your recording has been scheduled. Would you like to see some other TV Recommendations for tonight?","buttons":[{"type":"postback","title":"Show Recommendations","payload":"Show Recommendations"},{"type":"postback","title":"More Options","payload":"More Options"}]}}}};
				var msg = new builder.Message(usersession).sourceEvent(respobj);              
				usersession.send(msg);
			}
			else
			{
				var msg = "Sorry!, There is a problem occured in Scheduling( "+ subflow.facebook.result.msg + " ). Try some other.";
				usersession.send(msg);
			}
		}
		else
		{
			var msg = "Sorry!, There is a problem occured in Scheduling. Try some other.";
			usersession.send(msg);
		}
	}
	catch (err) 
	{
		console.log( "Error occured in recording: " + err);
		var msg = "Sorry!, There is a problem occured in Scheduling. Try some other.";
		usersession.send(msg);
	}
}


function testmethod(usersession)
{
 console.log("inside test method");
	var myobj=  {                  
						  "facebook": {
						"attachment": {
							"type": "template",
							"payload": {
								"template_type": "button",
								"text": "Are you looking for something to watch, or do you want to see more options? Type or tap below.",
								"buttons": [
									{
										"type": "postback",
										"title": "What's on tonight?",
										"payload": "On Later"
									},
									{
										"type": "postback",
										"title": "More Options",
										"payload": "More Options"
									}
								]
							}
						}}};
	
	  var msg = new builder.Message(usersession).sourceEvent(  
                                            myobj               
						);              
                                     usersession.send(msg);
	
	
	/*
usersession.send ( 
		{	"facebook": {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "button",
					"text": "Are you looking for something to watch, or do you want to see more options? Type or tap below.",
					"buttons": [
						{
							"type": "postback",
							"title": "What's on tonight?",
							"payload": "On Later"
						},
						{
							"type": "postback",
							"title": "More Options",
							"payload": "More Options"
						}
					]
				}
			
		}}}
	);	
*/

}
