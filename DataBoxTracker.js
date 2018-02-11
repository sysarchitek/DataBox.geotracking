// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')

const app = express()

//***
var lastMessage=null;
var lastObject=null;
var firstObject=null;
var _lat1=48.858;
var _lon1=2.296;
var _lat2=48.859;
var _lon2=2.297;
//***

app.listen(3300)
app.engine('.hbs', exphbs({
  defaultLayout: 'DataBoxMain',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

const azure=require('azure-storage');
const blobconnectionstring='DefaultEndpointsProtocol=https;AccountName=databoxstorage;AccountKey=[BlobContainerAccessKey]==;EndpointSuffix=core.windows.net';

//const multer=require('multer');
//npm install fs
const fs=require('fs');

//npm install multer
//npm install azure-storage
function upload_azure()
{
	var payload=lastObject.azure;
	console.log("#ok order to upload to azure");
	console.log("#file object is"+lastObject.azure);
	console.log("#inf filename is "+payload.originalname);
	
	//https://www.w3schools.com/nodejs/nodejs_uploadfiles.asp
	//https://www.ibm.com/developerworks/community/blogs/a509d54d-d354-451f-a0dd-89a2e717c10b/entry/How_to_upload_a_file_using_Node_js_Express_and_Multer?lang=en
	/*
	var storage = multer.diskStorage({
	  destination: function (req, azure, cb) {
	   cb(null, '/uploads/')
	   },
	   filename: function (req, azure, cb) {
	     cb(null, azure.originalname)
	   }
	 });
	*/
  
	
	//https://docs.microsoft.com/en-us/azure/storage/blobs/storage-nodejs-how-to-use-blob-storage
	var blobSvc = azure.createBlobService(blobconnectionstring);
	
	blobSvc.createContainerIfNotExists('databoxpayload', function(error, result, response){
	    if(!error)
	    	{
	    	console.log("#ok container is available");
	    	fs.writeFile("./"+payload.originalname, payload.b64, 'base64', function(err) {
	    		  console.log(err);
	    		});
	    	console.log("inf azure.b64 is"+payload.b64);
	    	// Container exists and is private
	    	//https://github.com/Azure/azure-storage-node/issues/22
	    	//https://azure.github.io/azure-storage-node/BlobService.html#createBlockBlobFromLocalFile__anchor
	    	var blobExist=0;
	    	blobSvc.listBlobsSegmented('databoxpayload', null, function(error, result, response){
	    		  if(!error){
	    			  blobExist=1;
	    			  //https://dmrelease.blob.core.windows.net/azurestoragejssample/samples/sample-blob.html
	    			  console.log("#inf there is a blob"+result.entries[0])
	    		      // result.entries contains the entries
	    		      // If not all blobs were returned, result.continuationToken has the continuation token.
	    		  }
	    		  else
	    			  {
	    			  console.log("#inf not blob exist.all cool")
	    			  }
	    		});
	    	if (blobExist>0)
	    		{
	    	blobSvc.deleteBlobIfExists('databoxpayload', 'databoxfile', 
    				function(error, result, response){
			    		  	if(!error){
			    		  			// file uploaded
			    		  			console.log("# cool, file is uploaded. Mission accomplished")
			    		  			}
			    		  	else
			    		  		{
			    		  		console.log("# cannot delete, someting went wrong:"+error);
			    		  		}
			    			});
	    		}
	    	blobSvc.createAppendBlobFromLocalFile('databoxpayload', 'databoxfile',"./"+payload.originalname, 
	    				function(error, result, response){
				    		  	if(!error){
				    		  			// file uploaded
				    		  			console.log("# cool, file is uploaded. Mission accomplished")
				    		  			}
				    		  	else
				    		  		{
				    		  		console.log("# not cool, canot createsometing went wrong:"+error);
				    		  		}
				    			});
	    	}
	    else
	    	{
	    	console.log("#KO cannot create container");
	    	}
	});
	
}

function trackit()
{
if (null==lastObject || null==lastObject["latitude"])
	{
	console.log("# war message is not geopos");
	if (null==lastObject["azure"])
			{
			console.log("#ko message is unknown"+lastObject)
			}
		else
			upload_azure();
	lastObject=null;
	}
if (null==firstObject)
	{
	_lat1=48.858;
	_lon1=2.296;
	_lat2=48.859;
	_lon2=2.297;
	console.log("#inf 1.1 is null fturi")
	}
else
	{
	myJson=firstObject;
	_lat1=myJson["latitude"];
	_lon1=myJson["longitude"];
	console.log("#inf 1.2 not null fturi")
	}
if (null!=lastObject)
	{
	myJson=lastObject;
	_lat2=myJson["latitude"];
	_lon2=myJson["longitude"];
	console.log("#inf 2.1 not null fturi")
	}
else
	console.log("#inf 2.2 null fturi")
}	

app.get('/', (request, response) => {
  response.render('DataBoxMap', {
    lat1: _lat1,
    lon1:_lon1,
    lat2:_lat2,
    lon2:_lon2
  })


})


/****** MQtt section ***/


const EventHubClient = require('azure-event-hubs').Client;

var connectionString = 'HostName=DataBoxHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=[HubAccessKey]=';

var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
  lastObject=message.body;
  if (null==firstObject)
	  firstObject=lastObject;
  lastMessage=JSON.stringify(message.body);
  trackit();
  console.log(lastMessage);
  console.log('');
};

var client = EventHubClient.fromConnectionString(connectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);