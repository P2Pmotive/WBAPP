sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'wbsync/test/integration/FirstJourney',
		'wbsync/test/integration/pages/offSyncWeightDetailsList',
		'wbsync/test/integration/pages/offSyncWeightDetailsObjectPage'
    ],
    function(JourneyRunner, opaJourney, offSyncWeightDetailsList, offSyncWeightDetailsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('wbsync') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheoffSyncWeightDetailsList: offSyncWeightDetailsList,
					onTheoffSyncWeightDetailsObjectPage: offSyncWeightDetailsObjectPage
                }
            },
            opaJourney.run
        );
    }
);