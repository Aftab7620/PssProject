
public class CloseExpiredPermitBatch implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
		return Database.getQueryLocator([SELECT Id FROM Permit_Application__c WHERE Expiry_Date__c < TODAY 
                                         AND Application_Status__c != 'Closed']);
    }
    
    public void execute(Database.BatchableContext bc, List<Permit_Application__c> scope) {
        for(Permit_Application__c rec : scope){
            rec.Application_Status__c = 'Closed';
        }

        update scope;
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Batch Completed: Expired Permits Closed');
    }
}
