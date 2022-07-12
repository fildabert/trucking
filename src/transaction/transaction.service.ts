import {
  TruckTransaction,
  TruckTransactionPayload,
  Transaction,
} from '../../types/common';
import customerRepository from '../customer/customer.repository';
import transactionRepository from './transaction.repository';

const validateAndModifyPayload = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const customer = await customerRepository.getCustomerByInitial(
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
  return modifiedPayload;
};

const createTruckTransaction = async (
  truckTransactionPayload: Omit<TruckTransaction, 'id'>
) => {
  const modifiedPayload = await validateAndModifyPayload(
    truckTransactionPayload
  );
  console.log(modifiedPayload, 'modifiedPayload');
  const newTruckTransaction =
    await transactionRepository.createTruckTransaction(modifiedPayload);
  return newTruckTransaction;
};

const createTransaction = async (transactionPayload) => {
  const newTransaction = await transactionRepository.createTransaction(
    transactionPayload
  );
  return newTransaction;
};

const getTruckTransactions = async () => {
  const transactions = await transactionRepository.getTruckTransactions();
  return transactions;
};

const getGroupedTruckTransactions = async () => {
  const transactions =
    await transactionRepository.getGroupedTruckTransactions();
  return transactions;
};

const getTruckTransactionsByCustomerId = async (customerId: string) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByCustomerId(customerId);
  return transactions;
};

const getTruckTransactionsByTruckId = async (truckId: string) => {
  const transactions =
    await transactionRepository.getTruckTransactionsByTruckId(truckId);
  return transactions;
};

const getMiscTruckTransactionsByTruckId = async (truckId: string) => {
  const transactions =
    await transactionRepository.getMiscTruckTransactionsByTruckId(truckId);
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

const getTruckTransactionAutoComplete = async () => {
  const truckTransactionAutoComplete =
    await transactionRepository.getTruckTransactionAutoComplete();

  return truckTransactionAutoComplete;
};

const printTransaction = async (transactionIds: string[]) => {
  return await transactionRepository.printTransaction(transactionIds);
};

const transactionService = {
  createTruckTransaction,
  createTransaction,
  getTruckTransactions,
  getGroupedTruckTransactions,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  getMiscTruckTransactionsByTruckId,
  editTruckTransaction,
  getTruckTransactionAutoComplete,
  printTransaction,
};

export default transactionService;
