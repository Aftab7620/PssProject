/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : subsidyController
 * Author          : <YourName>
 * Created Date    : Sep 23, 2026
 * Last Modified By: <YourName>
 * Last Modified On: Sep 23, 2026
 * Description     : This class implements for......
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Sep 23, 2026  │ <YourName>   │ Initial version
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */

public with sharing class SubsidyController {

    @AuraEnabled(cacheable=true)
    public static List<Subsidy_Assignment__c> getSubsidies(){
        return [
            SELECT Id, Name,
                   Category__c,
                   Request_Type__c,
                   Requested_Amount__c,
                   Approved_Amount__c,
                   Requested_Date__c,
                   Approved_Date__c,
                   Status__c,
                   Eligibility_Status__c,
                   Notes__c
            FROM Subsidy_Assignment__c
            ORDER BY CreatedDate DESC
        ];
    }

   @AuraEnabled
public static void createSubsidy( 
    Id permitId, 
    String category, 
    String requestType, 
    Decimal amount, 
    String notes 
){ 
    try {
        Subsidy_Assignment__c s = new Subsidy_Assignment__c(); 

        s.Permit_Application__c = permitId; 
        s.Category__c = category; 
        s.Request_Type__c = requestType; 
        s.Requested_Amount__c = amount; 
        s.Requested_Date__c = Date.today(); 
        s.Status__c = 'Requested'; 
        s.Notes__c = notes; 

        insert s;

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}

	@AuraEnabled(cacheable=true)
public static List<Permit_Application__c> getPermits() {
    return [
        SELECT Id, Name 
        FROM Permit_Application__c 
        ORDER BY CreatedDate DESC 
        LIMIT 50
    ];
}
}
