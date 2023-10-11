import { Office } from "./office";

export type MbRecord = {
    id?: string,
    mbNumber: string,
    issuedToOffice: Office,
    issuedOn: number,
    mbStatus: MbStatus
}

export enum MbStatus {
    OPEN = 'Open',
    CLOSED = 'Closed'
}