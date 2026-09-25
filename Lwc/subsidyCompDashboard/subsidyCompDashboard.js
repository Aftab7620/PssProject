import { LightningElement, wire, track } from 'lwc';
import getSubsidies from '@salesforce/apex/SubsidyController.getSubsidies';
import createSubsidy from '@salesforce/apex/SubsidyController.createSubsidy';
import getPermits from '@salesforce/apex/SubsidyController.getPermits';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import SUBSIDY_OBJECT from '@salesforce/schema/Subsidy_Assignment__c';
import CATEGORY_FIELD from '@salesforce/schema/Subsidy_Assignment__c.Category__c';
import REQUEST_TYPE_FIELD from '@salesforce/schema/Subsidy_Assignment__c.Request_Type__c';

export default class subsidyCompDashboard extends LightningElement {



    @track groupedData = [];
    @track totalCount = 0;
    @track pendingCount = 0;
    @track approvedCount = 0;
    @track reviewCount = 0;

    @track showModal = false;

    // 👉 Permit selection (IMPORTANT)
    @track permitOptions = [];
    @track selectedPermitId;

    @track subsidy = {
        category: '',
        requestType: '',
        requestedAmount: '',
        notes: ''
    };

    recordTypeId;
    @track categoryOptions = [];
    @track requestTypeOptions = [];

    wiredResult;



    @wire(getPermits)
    wiredPermits({ data, error }) {
        if (data) {
            this.permitOptions = data.map(p => ({
                label: p.Name,
                value: p.Id
            }));
        } else if (error) {
            console.error(error);
        }
    }

    handlePermitChange(event) {
        this.selectedPermitId = event.detail.value;
    }



    @wire(getSubsidies)
    wiredSubsidies(result) {
        this.wiredResult = result;

        if (result.data) {
            const data = result.data;

            this.totalCount = data.length;
            this.pendingCount = data.filter(s => s.Status__c === 'Requested').length;
            this.reviewCount = data.filter(s => s.Status__c === 'Under Review').length;
            this.approvedCount = data.filter(s => s.Status__c === 'Approved').length;

            this.groupDataByCategory(data);

        } else if (result.error) {
            console.error(result.error);
        }
    }



    groupDataByCategory(data) {
        let map = {};

        data.forEach(item => {
            let category = item.Category__c || 'Others';

            if (!map[category]) {
                map[category] = [];
            }

            map[category].push({
                id: item.Id,
                name: item.Name,
                status: item.Status__c,
                requestedAmount: item.Requested_Amount__c,
                approvedAmount: item.Approved_Amount__c,
                eligibility: item.Eligibility_Status__c,
                statusClass: `status ${this.getStatusClass(item.Status__c)}`
            });
        });

        this.groupedData = Object.keys(map).map(key => ({
            category: key,
            records: map[key]
        }));
    }



    getStatusClass(status) {
        if (status === 'Approved') return 'approved';
        if (status === 'Rejected') return 'rejected';
        if (status === 'Under Review') return 'review';
        if (status === 'Requested') return 'pending';
        return '';
    }



    @wire(getObjectInfo, { objectApiName: SUBSIDY_OBJECT })
    objectInfo({ data }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: CATEGORY_FIELD
    })
    categoryHandler({ data }) {
        if (data) {
            this.categoryOptions = data.values;
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: REQUEST_TYPE_FIELD
    })
    requestTypeHandler({ data }) {
        if (data) {
            this.requestTypeOptions = data.values;
        }
    }



    handleRequest() {
        this.resetForm();
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }



    handleChange(event) {
        const field = event.target.dataset.field;
        this.subsidy[field] = event.detail.value;
    }

    resetForm() {
        this.subsidy = {
            category: '',
            requestType: '',
            requestedAmount: '',
            notes: ''
        };

        this.selectedPermitId = null; 
    }



    submitSubsidy() {

        // 🔥 REQUIRED VALIDATIONS
        if (!this.selectedPermitId) {
            this.showToast('Error', 'Please select a Permit', 'error');
            return;
        }

        if (!this.subsidy.category || !this.subsidy.requestedAmount) {
            this.showToast('Error', 'Please fill required fields', 'error');
            return;
        }

        createSubsidy({
            permitId: this.selectedPermitId, // ✅ FIXED
            category: this.subsidy.category,
            requestType: this.subsidy.requestType,
            amount: this.subsidy.requestedAmount,
            notes: this.subsidy.notes
        })
        .then(() => {

            this.showModal = false;

            this.showToast('Success', 'Subsidy Requested Successfully', 'success');

            return refreshApex(this.wiredResult);

        })
        .catch(error => {
            console.error(error);
            this.showToast('Error', 'Error creating subsidy', 'error');
        });
    }



    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
