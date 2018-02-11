Project:
https://github.com/sysarchitek/DataBox.geotracking
Solution:
https://github.com/sysarchitek/DataBox-IOT-Emulator

author: Francois TURI

# geotracking
DataBox geotracking simulator

Please Edit DataBoxTracker.js the following lines:

26:const azure=require('azure-storage');
const blobconnectionstring='DefaultEndpointsProtocol=https;AccountName=databoxstorage;AccountKey=[BlobContainerAccessKey]==;EndpointSuffix=core.windows.net';


170:****** MQtt section ***/


const EventHubClient = require('azure-event-hubs').Client;

var connectionString = 'HostName=DataBoxHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=[HubAccessKey]=';


And Views>Layouts>DataBoxMain.hbs
    <!-- Google Maps JS API -->
    <script src="https://maps.googleapis.com/maps/api/js?key=[GoogleApiKey]c&callback=initMap"></script>
    <!-- GMaps Library -->



