export interface Office {
    id?: string,
    name: string,
    address: string,
    isFocal?: boolean,
    subOffices?: Office[]
}