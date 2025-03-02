export interface TransactionForm {
    MvtID: number,
    MvtKey: number,
    MvtDate: string,
    MvtValueDate: string,
    MvtDateReconciled: null,
    RefRem: string,
    MvtCurrency: string,
    MvtAmountSent: number,
    MvtAmountRcvd: string,
    MvtReconciled: string,
    MvtBkClearing: string,
    MvtBkAccount: string,
    MvtType: string,
    MvtUserReconciled: string,
    MvtDtLastUpdate: number,
    MvtDtUser: string,
    PIStatus: string,
    MvtlRef: string,
    MvtDtCreated: number,
    BkiAccountName: string,
    CieDesc: string
}


export interface PaginationResponse<T> {
    data: T[];
    totalRecords: number; // Total records
}
