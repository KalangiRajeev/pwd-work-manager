import { Agency } from "./agency"
import { Office } from "./office"

export interface AgreementRegister {
    id? : string,
    nameOfWork: string,
    agreementNumber: string,
    dateOfAgreement: number,
    estimateContractValue: number,
    tenderPercentage: number,
    tenderQuote: TenderQuote,
    dueDateOfCompletion: number,
    agency: Agency,
    office: Office,
    associatedOffice: Office,
    technicalSanctionReference: string,
    administrativeSanctionReference: string,
    workStatus: WorkStatus
    modifiedOn: number,
    modifiedBy: string,
    extensionOfTime?: number,
    remarks?: string 
}

export enum TenderQuote {
    LESS = 'Less',
    EQUALS = 'Equals',
    EXCESS = '  Excess'
}

export enum WorkStatus {
    PENDING = 'Pending',
    IN_PROGRESS= 'In-Progress',
    NOT_YET_STARTED = 'Not yet started',
    COMPLETED = 'Completed',
}

export const Colors = {
    IN_PROGRESS : 'primary',
    COMPLETED : 'accent',
    NOT_YET_STARTED : 'warn',
    PENDING : 'warn',
    ALL : 'medium',
}