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
}

export enum TenderQuote {
    LESS = 'Less',
    EQUALS = 'Equals',
    EXCESS = '  Excess'
}

export enum WorkStatus {
    NOT_YET_STARTED = 'Not yet started',
    PENDING = 'Pending',
    IN_PROGRESS= 'In-Progress',
    COMPLETED = 'Completed',
}

export const Colors = {
    IN_PROGRESS : 'primary',
    COMPLETED : 'success',
    NOT_YET_STARTED : 'warning',
    PENDING : 'danger',
    ALL : 'medium',
}