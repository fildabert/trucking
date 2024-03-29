import { Customer } from '../../types/common';
import customerRepository from './customer.repository';

const createCustomer = async (customerPayload: Omit<Customer, 'id'>) => {
  const newCustomer = await customerRepository.createCustomer(customerPayload);
  return newCustomer;
};

const getCustomers = async () => {
  const customers = await customerRepository.getCustomers();
  return customers;
};

const getCustomerByCustomerId = async (customerId: string) => {
  const customer = await customerRepository.getCustomerByCustomerId(customerId);
  return customer;
};

const getCustomerByInitial = async (customerInitial: string) => {
  const customer = await customerRepository.getCustomerByInitial(
    customerInitial
  );
  return customer;
};

const editCustomer = async (customerPayload: Customer) => {
  const editCustomer = await customerRepository.editCustomer(
    customerPayload
  );
  return editCustomer;
};

const customerService = {
  createCustomer,
  getCustomers,
  getCustomerByCustomerId,
  getCustomerByInitial,
  editCustomer
};

export default customerService;
