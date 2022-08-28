import { CustomerIdQuery, TruckIdQuery, DateQuery } from './../../types/common';
import {
  TruckTransaction,
  TruckTransactionPayload,
  FilterTransactionsQuery,
  AdditionalTruckTransaction,
  TransactionSummaryQuery,
  TransactionSummary,
  TotalSummary,
  Transaction,
  TransactionType,
} from '../../types/common';
import transactionRepository from './transaction.repository';
import truckRepository from '../truck/truck.repository';

import {
  formatRupiah,
  formatDate,
  indexPlusOne,
} from '../../helpers/hbsHelpers';
import fs from 'fs';
import handlers from 'handlebars';
import path from 'path';
import customerService from '../customer/customer.service';
import htmlToPdf from 'html-pdf';

const templateDirectory = path.resolve(process.cwd(), 'templates');

const validateAndModifyPayload = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const customer = await customerService.getCustomerByInitial(
    truckTransactionPayload.customer
  );
  if (!customer) {
    throw new Error('Customer tidak terdaftar');
  }
  const modifiedPayload: TruckTransactionPayload = {
    ...truckTransactionPayload,
    customer: {
      customerId: customer.id,
      initial: customer.initial,
    },
  };

  if (truckTransactionPayload.pph) {
    modifiedPayload.income =
      truckTransactionPayload.sellingPrice -
      truckTransactionPayload.sellingPrice *
        (truckTransactionPayload.pph / 100);
  } else {
    modifiedPayload.income = truckTransactionPayload.sellingPrice;
  }

  return modifiedPayload;
};

const createTruckTransaction = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const modifiedPayload = await validateAndModifyPayload(
    truckTransactionPayload
  );
  const newTruckTransaction =
    await transactionRepository.createTruckTransaction(modifiedPayload);
  return newTruckTransaction;
};

const createAdditionalTruckTransaction = async (
  transactionPayload: AdditionalTruckTransaction
) => {
  const newTransaction =
    await transactionRepository.createAdditionalTruckTransaction(
      transactionPayload
    );
  return newTransaction;
};

const getTransactions = async (date: TransactionSummaryQuery) => {
  const transactions = await transactionRepository.getTransactions(date);
  return transactions;
};

const createTransaction = async (transactionPayload: Transaction) => {
  const newTransaction = await transactionRepository.createTransaction(
    transactionPayload
  );
  return newTransaction;
};

const editTransaction = async (transactionPayload: Transaction) => {
  const newTransaction = await transactionRepository.editTransaction(
    transactionPayload
  );
  return newTransaction;
};

const deleteTransaction = async (transactionId: string) => {
  const transaction = await transactionRepository.deleteTransaction(
    transactionId
  );
  return transaction;
};

const getTruckTransactions = async () => {
  const transactions = await transactionRepository.getTruckTransactions();
  return transactions;
};
const getGroupedTruckTransactions = async (date: TransactionSummaryQuery) => {
  const transactions = await transactionRepository.getAllTransactions(date);
  const trucks = await truckRepository.getTrucks();

  const summary: TransactionSummary = {};
  for (const transaction of transactions) {
    const truckName = trucks.find((t) => t.id === transaction.truckId)?.name;
    if (!truckName) {
      continue;
    }

    if (!summary[truckName]) {
      summary[truckName] = {
        truckId: transaction.truckId,
        cost: 0,
        additionalCost: 0,
        sellingPrice: transaction.sellingPrice,
        margin: transaction.sellingPrice - transaction.cost,
      };
      if (transaction.transactionType == 'TRUCK_TRANSACTION') {
        summary[truckName].cost = transaction.cost;
      } else {
        summary[truckName].additionalCost = transaction.cost;
      }
    } else {
      summary[truckName] = {
        truckId: transaction.truckId,
        cost:
          transaction.transactionType == 'TRUCK_TRANSACTION'
            ? summary[truckName].cost + transaction.cost
            : summary[truckName].cost,
        additionalCost:
          transaction.transactionType == 'TRUCK_ADDITIONAL_TRANSACTION'
            ? summary[truckName].additionalCost + transaction.cost
            : summary[truckName].additionalCost,
        sellingPrice:
          summary[truckName].sellingPrice +
          (transaction.sellingPrice ? transaction.sellingPrice : 0),
        margin:
          summary[truckName].margin +
          (transaction.sellingPrice
            ? transaction.sellingPrice - transaction.cost
            : 0 - transaction.cost),
      };
    }
  }

  return summary;
};

const getTotalSummary = async (date: TransactionSummaryQuery) => {
  const transactions = await transactionRepository.getAllTransactions(date);

  const summary: TotalSummary = {
    totalAdditionalCost: 0,
    totalTripCost: 0,
    totalTripSellingPrice: 0,
    totalMargin: 0,
  };

  for (const transaction of transactions) {
    if (
      transaction.transactionType === TransactionType.TRUCK_TRANSACTION ||
      transaction.transactionType ===
        TransactionType.TRUCK_ADDITIONAL_TRANSACTION
    ) {
      summary.totalTripCost += transaction.cost;
    }

    if (
      transaction.transactionType === TransactionType.ADDITIONAL_TRANSACTION
    ) {
      summary.totalAdditionalCost += transaction.cost;
    }

    summary.totalTripSellingPrice += transaction.sellingPrice
      ? transaction.sellingPrice
      : 0;

    summary.totalMargin += transaction.sellingPrice
      ? transaction.sellingPrice - transaction.cost
      : 0 - transaction.cost;
  }

  return summary;
};

const getTruckTransactionsByCustomerId = async ({
  customerId,
  startDate,
  endDate,
}: CustomerIdQuery) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByCustomerId(
      customerId,
      startDate,
      endDate
    );
  return transactions;
};

const getTruckTransactionsByTruckId = async ({
  truckId,
  startDate,
  endDate,
}: TruckIdQuery) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByTruckId(
      truckId,
      startDate,
      endDate
    );
  return transactions;
};

const getAdditionalTruckTransactionsByTruckId = async ({
  truckId,
  startDate,
  endDate,
}: TruckIdQuery) => {
  const transactions =
    await transactionRepository.getAdditionalTruckTransactionsByTruckId(
      truckId,
      startDate,
      endDate
    );
  return transactions;
};

const editTruckTransaction = async (
  editTruckTransactionPayload: TruckTransaction
) => {
  const modifiedPayload = await validateAndModifyPayload(
    editTruckTransactionPayload
  );

  const editTruckTransaction = await transactionRepository.editTruckTransaction(
    { ...modifiedPayload, id: editTruckTransactionPayload.id }
  );
  return editTruckTransaction;
};

const editAdditionalTruckTransaction = async (
  editAdditionalTruckTransactionPayload: AdditionalTruckTransaction
) => {
  const editAdditionalTruckTransaction =
    await transactionRepository.editAdditionalTruckTransaction({
      ...editAdditionalTruckTransactionPayload,
      id: editAdditionalTruckTransactionPayload.id,
    });
  return editAdditionalTruckTransaction;
};

const getTruckTransactionAutoComplete = async () => {
  const truckTransactionAutoComplete =
    await transactionRepository.getTruckTransactionAutoComplete();

  return truckTransactionAutoComplete;
};

const printTransaction = async (
  invoiceNum: string,
  transactionIds: string[],
  type: string,
  endDate: Date
) => {
  handlers.registerHelper('formatRupiah', formatRupiah);
  handlers.registerHelper('formatDate', formatDate);
  handlers.registerHelper('indexPlusOne', indexPlusOne);

  const truckTransactions = await transactionRepository.printTransaction(
    transactionIds
  );

  const totalSellingPrice = truckTransactions.reduce(
    (accumulator, obj) =>
      accumulator + (obj.income ? obj.income : obj.sellingPrice),
    0
  );

  const trucks = await truckRepository.getTrucks();
  const customer = await customerService.getCustomerByInitial(
    truckTransactions[0].customer
  );

  for (const truckTransaction of truckTransactions) {
    const licenseNumber = trucks.find(
      (t) => t.id === truckTransaction.truckId
    )?.licenseNumber;

    const truckName = trucks.find(
      (t) => t.id === truckTransaction.truckId
    )?.name;

    truckTransaction.licenseNumber = licenseNumber;
    truckTransaction.truckName = truckName;
  }

  const sortedTruckTransactions = truckTransactions.sort((a, b) => {
    return (
      a.truckName.localeCompare(b.truckName) ||
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  let runningCounter = 1;
  let havePPH = false;

  sortedTruckTransactions.forEach((trax) => {
    if (trax.pph) {
      havePPH = true;
    }
    trax.index = runningCounter;
    runningCounter += 1;
  });

  const transactionsInPage = sortedTruckTransactions.reduce(
    (result, transaction) => {
      function insertTransactionToPage(limit: number) {
        if (result[result.length - 1].length < limit) {
          result[result.length - 1].push(transaction);
        } else {
          result.push([]);
          result[result.length - 1].push(transaction);
        }
      }
      if (result.length <= 1) {
        if (type == 'bon') {
          insertTransactionToPage(17);
        } else {
          if (havePPH) {
            insertTransactionToPage(13);
          } else {
            insertTransactionToPage(15);
          }
        }
        // first page
      } else {
        if (type == 'bon') {
          insertTransactionToPage(19);
        } else {
          if (havePPH) {
            insertTransactionToPage(15);
          } else {
            insertTransactionToPage(16);
          }
        }
      }

      return result;
    },
    [[]] as TruckTransaction[][]
  );

  const content = {
    main: {
      endDate,
      invoiceNum,
      currentDate: new Date(),
      customerInitial: sortedTruckTransactions[0].customer,
      customerName: customer?.name,
      totalSellingPrice,
      noRek: '',
      atasNama: '',
    },
    transactions: sortedTruckTransactions,
    transactionsInPage,
    havePPH,
  };

  if (type == 'tagihanYang') {
    content.main.noRek = '8195314663';
    content.main.atasNama = 'Ali Martono';
  } else {
    content.main.noRek = '2421210537';
    content.main.atasNama = 'MERY';
  }

  let file;
  if (type === 'bon') {
    file = fs.readFileSync(path.join(templateDirectory, 'bon.html'), 'utf8');
  } else {
    file = fs.readFileSync(
      path.join(templateDirectory, 'tagihan.html'),
      'utf8'
    );
  }

  const template = handlers.compile(`${file}`);
  const html = template(content);
  // fs.writeFileSync('temp.html', html, 'utf-8');

  const pdf = htmlToPdf.create(html, {
    format: 'A4',
    phantomPath: '/usr/local/bin/phantomjs',
  });

  return pdf;
};

const printSummary = async ({ startDate, endDate }: DateQuery) => {
  handlers.registerHelper('formatRupiah', formatRupiah);
  handlers.registerHelper('formatDate', formatDate);

  const summary = await getGroupedTruckTransactions({ startDate, endDate });
  const transactions = await transactionRepository.getTransactions({
    startDate,
    endDate,
  });

  const totalSellingPrice = Object.values(summary).reduce(
    (acc, obj) => acc + obj.sellingPrice,
    0
  );
  const totalTruckCost = Object.values(summary).reduce(
    (acc, obj) => acc + obj.cost,
    0
  );
  const totalAdditionalCost = Object.values(summary).reduce(
    (acc, obj) => acc + obj.additionalCost,
    0
  );
  const miscTransactionsTotal = transactions.reduce(
    (acc, obj) => acc + obj.cost,
    0
  );
  const totalCost = totalAdditionalCost + miscTransactionsTotal;
  const totalTruckMargin =
    totalSellingPrice - totalTruckCost - totalAdditionalCost;
  const totalMargin = totalSellingPrice - totalCost - totalTruckCost;

  const transactionsInPage = transactions.reduce(
    (result, transaction) => {
      function insertTransactionToPage(limit: number) {
        if (result[result.length - 1].length < limit) {
          result[result.length - 1].push(transaction);
        } else {
          result.push([]);
        }
      }
      if (result.length <= 1) {
        // first page
        insertTransactionToPage(11);
      } else {
        insertTransactionToPage(23);
      }

      return result;
    },
    [[]] as Transaction[][]
  );

  const content = {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    summary,
    transactions,
    totalSellingPrice,
    totalTruckCost,
    totalAdditionalCost,
    totalCost,
    totalTruckMargin,
    totalMargin,
    miscTransactionsTotal,
    transactionsInPage,
  };

  const file = fs.readFileSync(
    path.join(templateDirectory, 'laporan.html'),
    'utf8'
  );
  const template = handlers.compile(`${file}`);
  const html = template(content);

  return htmlToPdf.create(html, {
    format: 'A4',
    phantomPath: '/usr/local/bin/phantomjs',
  });
};

const filterTruckTransactions = async (query: FilterTransactionsQuery) => {
  // TODO
  transactionRepository.filterTruckTransactions(query);
};

const updatePrintStatus = async (transactionIds: string[], type: string) => {
  transactionRepository.updatePrintStatus(transactionIds, type);
};

const transactionService = {
  createTruckTransaction,
  createAdditionalTruckTransaction,
  getTruckTransactions,
  deleteTransaction,
  getGroupedTruckTransactions,
  getTotalSummary,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  getAdditionalTruckTransactionsByTruckId,
  editTruckTransaction,
  editAdditionalTruckTransaction,
  getTruckTransactionAutoComplete,
  printTransaction,
  filterTruckTransactions,
  getTransactions,
  createTransaction,
  editTransaction,
  printSummary,
  updatePrintStatus,
};

export default transactionService;
