import { LightningElement, api, wire, track } from 'lwc';
import getPermit from '@salesforce/apex/PermitTrackerController.getPermit';
import createGrievance from '@salesforce/apex/PermitTrackerController.createGrievance';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import PERMIT_OBJECT from '@salesforce/schema/Permit_Application__c';
import STATUS_FIELD from '@salesforce/schema/Permit_Application__c.Application_Status__c';

export default class PermitTracker extends LightningElement {

    
    @api recordId;

    @track permit = {};
    @track steps = [];
    @track isRejected = false;

    @track showModal = false;

        connectedCallback() {
    console.log('Component Loaded');

    const url = window.location.pathname;
    console.log('URL => ', url);

    // Split URL
    const parts = url.split('/');

    // Find recordId (after permit-application)
    const index = parts.indexOf('permit-application');

    if (index !== -1 && parts.length > index + 1) {
        this.recordId = parts[index + 1];
    }

    console.log('RECORD ID => ', this.recordId);
}

    @wire(CurrentPageReference)
getStateParameters(pageRef) {
    if (pageRef) {
        console.log('FULL PAGE REF => ', JSON.stringify(pageRef));

        // 🔥 IMPORTANT FIX
        this.recordId = pageRef.attributes?.recordId;

        console.log('RECORD ID => ', this.recordId);
    }
}

    

    recordTypeId;

    /* 🔹 GET OBJECT INFO */
    @wire(getObjectInfo, { objectApiName: PERMIT_OBJECT })
    objectInfo({ data }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        }
    }

    /* 🔹 GET PICKLIST VALUES */
    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: STATUS_FIELD
    })
    picklistHandler({ data }) {
        if (data && this.permit.Application_Status__c) {
            this.generateSteps(data.values);
        }
    }

    /* 🔹 FETCH PERMIT */
    @wire(getPermit, { recordId: '$recordId' })
    wiredPermit({ data, error }) {
        if (data) {
            this.permit = data;

            // if picklist already loaded
            if (this.recordTypeId) {
                // steps will be auto generated
            }

        } else if (error) {
            console.error(error);
        }
    }

    /* 🔥 GENERATE TIMELINE */
    generateSteps(picklistValues) {

        const status = this.permit.Application_Status__c;

        const iconsMap = {
            'Submitted': 'standard:task',
            'Review': 'standard:document',
            'Approved': 'standard:approval',
            'Issued': 'standard:reward',
            'Rejected': 'utility:close',
            'Closed': 'utility:lock'
        };

        const currentIndex = picklistValues.findIndex(v => v.value === status);

        this.steps = picklistValues.map((item, index) => {

            let iconClass = 'icon-circle';
            let lineClass = 'line';

            if (index < currentIndex) {
                iconClass += ' completed';
                lineClass += ' completed';
            } 
            else if (index === currentIndex) {

                if (status === 'Rejected') {
                    iconClass += ' rejected';
                } else {
                    iconClass += ' active';
                }
            }

            return {
                value: item.label,
                icon: iconsMap[item.value] || 'standard:record',
                iconClass: iconClass,
                lineClass: lineClass,
                isLast: index === picklistValues.length - 1
            };
        });

        this.isRejected = (status === 'Rejected');
    }

    /* 🔹 GETTERS */

    get cinemaName() {
        return this.permit?.Cinema_Owner_Account__r?.Name || 'N/A';
    }

    get applicantName() {
        return this.permit?.Cinema_Owner_Contact__r?.Name || 'N/A';
    }

    get applicantEmail() {
        return this.permit?.Cinema_Owner_Contact__r?.Email || 'N/A';
    }

    get applicantPhone() {
        return this.permit?.Cinema_Owner_Contact__r?.Phone || 'N/A';
    }

    get category() {
        return this.permit?.Application_Category__c || 'N/A';
    }

    get status() {
        return this.permit?.Application_Status__c || 'N/A';
    }

    get fee() {
        return this.permit?.Fee_Amount__c || '0';
    }

    /* 🔹 MODAL HANDLING */

    openModal() {
        this.grievance = {
            Subject__c: '',
            Description__c: ''
        };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this.grievance[field] = event.target.value;
    }

    /* 🔹 SAVE GRIEVANCE */

    submitGrievance() {

        if (!this.grievance.Subject__c || !this.grievance.Description__c) {
            this.showToast('Error', 'Please fill all fields', 'error');
            return;
        }

        createGrievance({
            permitId: this.recordId,
            subject: this.grievance.Subject__c,
            description: this.grievance.Description__c
        })
        .then(() => {
            this.showModal = false;

            this.showToast('Success', 'Grievance Created Successfully', 'success');
        })
       .catch(error => {
    console.error('FULL ERROR => ', JSON.stringify(error));

    this.showToast(
        'Error',
        error.body?.message || 'Error creating grievance',
        'error'
    );
});
    }

    /* 🔹 TOAST */

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}
