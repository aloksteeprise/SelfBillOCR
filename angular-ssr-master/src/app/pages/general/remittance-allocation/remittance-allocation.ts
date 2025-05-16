export interface AllocateToInvoiceItem {
    AutoID: number;
    ALDCode: number;
    AllocationCode: string;
    AllocationType: string;
    InvhCode: string;
    InvhCodeOtherCurrency: string;
    InvoiceItem: string;
    AmountToAllocate: number;
    AgencyCommission: number;
    OurFee: number;
    ContractorDue: number;
    VAT: number;
    Description: string;
    DueByAgency: number;
    BCContractor: number;
    BCSMTG: number;
    TaxWithHeld: number;
    Factoring: number;
    PendingLeftDue: number;
  }