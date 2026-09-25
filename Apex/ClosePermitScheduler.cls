public class ClosePermitScheduler implements Schedulable {

    public void execute(SchedulableContext sc) {

        CloseExpiredPermitBatch batch = new CloseExpiredPermitBatch();

        Database.executeBatch(batch, 200);
    }
}
