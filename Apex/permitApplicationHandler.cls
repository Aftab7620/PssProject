public class permitApplicationHandler {
    
    public static void shareRecordWithInspector(list<Permit_Application__c> newlist){
        
        list<Permit_Application__share> recordList=new list<Permit_Application__share>();
        for(Permit_Application__c pa:newlist){
            if(pa.Application_Status__c=='Submitted'&& pa.Inspector__c!=null){
                Permit_Application__share rec=new Permit_Application__share();
                rec.ParentId=pa.Id;
                rec.UserOrGroupId=pa.Inspector__c;
                rec.AccessLevel='Read';
                rec.RowCause=Schema.Permit_Application__share.RowCause.Manual;
                recordList.add(rec);       
            }
        }
        
        if(recordList.size()>0){
            insert recordList;
            system.debug(recordList);
        }
        
    }

}
