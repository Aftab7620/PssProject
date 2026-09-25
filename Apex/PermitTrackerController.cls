/**
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 * Class Name      : PermitTrackerController
 * Author          : <Aftab>
 * Created Date    : Sep 23, 2026
 * Last Modified By: <YourName>
 * Last Modified On: Sep 23, 2026
 * Description     : This class implements for......
 *  
 * Change History  :
 *  Date          │   Author     │   Change
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 *  Sep 23, 2026  │ <Aftab>   │ Initial version
 * ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
 */
public without sharing class PermitTrackerController {

    @AuraEnabled(cacheable=true)
    public static Permit_Application__c getPermit(Id recordId){
        return [SELECT Id, Name,Application_Status__c,Permit_Type__c,Application_Category__c,Cinema_Owner_Account__r.Name,
       Cinema_Owner_Contact__r.Name,Cinema_Owner_Contact__r.Email,Cinema_Owner_Contact__r.Phone,Submission_Date__c,
       Fee_Amount__c FROM Permit_Application__c WHERE Id = :recordId];
    }

    @AuraEnabled
public static void createGrievance(Id permitId, String subject, String description){

    Grievance__c g = new Grievance__c();

    g.Permit_Application__c = permitId;
    g.Subject__c = subject;
    g.Description__c = description;

    g.Status__c = 'Open'; // make sure this value exists in picklist
    g.Submitted_Date__c = Date.today();

    insert g;
}
}
