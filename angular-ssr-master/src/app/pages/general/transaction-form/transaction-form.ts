export interface TransactionForm {
    MvtID: number;
    MvtKey: number;
    MvtDate: string;
    MvtValueDate: string;
    MvtDateReconciled: string | null;
    RefRem: string;
    MvtCurrency: string;
    MvtAmountSent: number;
    MvtAmountRcvd: number;
    MvtReconciled: string;
    MvtBkClearing: string;
    MvtBkAccount: string;
    MvtType: string;
    MvtUserReconciled: string;
    MvtDtLastUpdate: string | null;
    MvtDtUser: string;
    PIStatus: string;
    MvtlRef: string;
    MvtDtCreated: string | null;
    BkiAccountName: string;
    CieDesc: string;
}

export interface PaginationResponse<T> {
    data: T[];
    totalRecords: number;
}

export interface Company {
    cieCode: number;
    cieDesc: string | null;
}
