import { FinancialYear } from "./financialyear";

export const AGENCIES = 'agencies';
export const OFFICES = 'pwd-offices';
export const MB_RECORDS = 'mb-records';
export const AGREEMENT_REGISTER = 'agreement-register';
export const MEASUREMENTS = 'measurements';
export const SUPPL_AGT_DETAILS = 'suppl-agt-details';
export const BILLS = 'bills';
export const USERS = 'users';
export const STORAGE_UPLOADS = 'storage-uploads'

export const getFinancialYears = () : FinancialYear[] => {
    const thisYear = (new Date()).getFullYear();
    const yearArray: FinancialYear[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => {
        const fy: FinancialYear =  {
            year: `${thisYear - count}-${(thisYear - count + 1).toString().slice(-2)}`,
            startDate: new Date(`${thisYear - count}-04-01`),
            endDate: new Date(`${thisYear - count + 1}-03-31`)
        }
        return fy;
    })
    return yearArray;
};

