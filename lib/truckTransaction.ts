import {
  BASE_URL,
  TransactionSummaryQuery,
  DateQuery,
} from './../types/common';
import axios from 'axios';
import { TruckTransaction, AdditionalTruckTransaction } from '../types/common';
import { CookieValueTypes } from 'cookies-next';

const getTruckTransactions = async () => {
  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/truck`,
  });
  if (response && response.data) {
    return response.data.data as TruckTransaction[];
  }
  return [];
};

const getGroupedTruckTransactions = async ({
  access_token,
  startDate,
  endDate,
}: TransactionSummaryQuery) => {
  if (!access_token) throw new Error('Invalid token');

  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/summary/trucks`,
    headers: {
      access_token,
    },
    params: {
      startDate,
      endDate,
    },
  });
  if (response && response.data) {
    return response.data.data;
  }
  return {};
};

const getTotalSummary = async ({
  access_token,
  startDate,
  endDate,
}: TransactionSummaryQuery) => {
  if (!access_token) return {};

  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/summary/`,
    headers: {
      access_token: access_token.toString(),
    },
    params: {
      startDate,
      endDate,
    },
  });
  if (response && response.data) {
    return response.data.data;
  }

  return {};
};

const getTruckTransactionsByCustomerId = async (
  access_token: CookieValueTypes,
  customerId: string,
  startDate: Date,
  endDate: Date
) => {
  if (!access_token) throw new Error('Invalid token');

  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/customer/${customerId}`,
    headers: {
      access_token,
    },
    params: {
      startDate,
      endDate,
    },
  });
  if (response && response.data) {
    return response.data.data as TruckTransaction[];
  }
  return [];
};

const getTruckTransactionsByTruckId = async (
  access_token: CookieValueTypes,
  truckId: string,
  startDate: Date,
  endDate: Date
) => {
  if (!access_token) throw new Error('Invalid token');

  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/truck/${truckId}`,
    headers: {
      access_token: access_token,
    },
    params: {
      startDate,
      endDate,
    },
  });
  if (response && response.data) {
    return response.data.data as TruckTransaction[];
  }
  return [];
};

const getAdditionalTruckTransactionsByTruckId = async (
  truckId: string,
  startDate: Date,
  endDate: Date
) => {
  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/truck/misc`,
    params: {
      truckId,
      startDate,
      endDate,
    },
  });
  if (response && response.data) {
    return response.data.data as AdditionalTruckTransaction[];
  }
  return [];
};

const getTruckTransactionAutoComplete = async (): Promise<
  Record<string, string[]>
> => {
  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/truck/auto-complete`,
  });
  if (response && response.data) {
    return response.data.data as Record<string, string[]>;
  }
  return {};
};

const printTransactions = async (invoiceNum:string, transactionIds: string[], type: string, endDate: Date) => {
  const response = await axios({
    method: 'POST',
    url: `${BASE_URL}/api/transaction/print`,
    data: {
      invoiceNum,
      transactionIds,
      type,
      endDate
    },
    responseType: 'blob',
  });

  const saveAsPDF = async (response: BlobPart) => {
    const blob = new Blob([response]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.pdf';
    link.click();
  };

  saveAsPDF(response.data);

  if (response) return 'Print Success';
  return 'Print Failed';
};

const printSummary = async ({ startDate, endDate }: DateQuery) => {
  const response = await axios({
    method: 'GET',
    url: `${BASE_URL}/api/transaction/printSummary`,
    responseType: 'blob',
    params: {
      startDate,
      endDate,
    },
  });

  const saveAsPDF = async (response: BlobPart) => {
    const blob = new Blob([response]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'summary.pdf';
    link.click();
  };

  saveAsPDF(response.data);

  if (response) return 'Print Success';
  return 'Print Failed';
};

const truckTransactionBloc = {
  getTruckTransactions,
  getGroupedTruckTransactions,
  getTotalSummary,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  getAdditionalTruckTransactionsByTruckId,
  getTruckTransactionAutoComplete,
  printTransactions,
  printSummary,
};

export default truckTransactionBloc;
