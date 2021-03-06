import { TruckTransaction, TruckTransactionPayload } from '../../types/common';
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

const createTransaction = async (
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

const getTruckTransactions = async () => {
  const transactions = await transactionRepository.getTruckTransactions();
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
  await transactionRepository.printTransaction(transactionIds);
};

const transactionService = {
  createTransaction,
  getTruckTransactions,
  getTruckTransactionsByCustomerId,
  getTruckTransactionsByTruckId,
  editTruckTransaction,
  getTruckTransactionAutoComplete,
  printTransaction,
};

export default transactionService;
