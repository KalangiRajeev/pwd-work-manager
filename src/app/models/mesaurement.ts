import { MbRecord } from "./mbrecord"
import { Office } from "./office"

export type Measurement = {
    id? : string,
    agtRegId: string,
    agtNo?: string,
    mb: MbRecord,
    measurementType: MeasurementType,
    fromPg: number,
    toPg: number,
    dateOfMeasurement: number,
    measuredByOffice: Office,
    dateOfCheckMeasurement?: number,
    checkMeasurementOffice?: Office,    
    lastModififedOn: number
}

export enum MeasurementType {
    PART = 'PART',
    FINAL = 'FINAL'
}