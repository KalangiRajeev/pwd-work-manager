import { MbRecord } from "./mbrecord"
import { Office } from "./office"

export type Bill = {
    id? : string,
    agtRegId: string,
    agtNo?: string,
    mb: MbRecord,
    billType: BillType,
    fromPg: number,
    toPg: number,
    dateOfRecommendation: number,
    officeRecommended: Office,
    currentBillAmount: number,
    uptoDateBillAmount: number,
    lastModifiedOn: number
}

export enum BillType {
    PART = 'PART',
    FINAL = 'FINAL'
}