import { Agency } from "./agency";
import { Office } from "./office";

export interface SupplAgtDetails {
    id?: string,
    agtRegId: string,
    techApprovalRef: string,
    supplAgtNumber:string,
    dateOfSupplAgt: number,
    supplAgtAmount: number,
    conclAtOffice: Office,
    agency: Agency,
    lastModifiedOn: number,
    lastModifiedBy?: string
}