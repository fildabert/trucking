import Head from 'next/head';
import { InferGetServerSidePropsType } from 'next';
import truckTransactionBloc from '../../lib/truckTransaction';
import {
  DataTableTruckTransaction,
  TruckTransaction,
} from '../../types/common';
import TruckTransactionDataTable from '../../components/truck-transaction-data-table';
import customerBloc from '../../lib/customer';

export default function CustomerDetails({
  truckTransactions,
  autoCompleteData,
  customer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const dataTableHeaders = {
    Tanggal: 'w-1/12',
    'No. Container': 'w-2/12',
    'No. Bon': 'w-1/12',
    Tujuan: 'w-2/12',
    Borongan: 'w-1/12',
    Pembayaran: 'w-1/12',
    EMKL: 'w-1/12',
    'Info Tambahan': 'w-3/12',
  };
  const formatTruckTransaction = (
    truckTransaction: TruckTransaction
  ): DataTableTruckTransaction => {
    return {
      id: truckTransaction.id,
      date: new Date(truckTransaction.date).toLocaleDateString('id-ID'),
      containerNo: truckTransaction.containerNo,
      invoiceNo: truckTransaction.invoiceNo,
      destination: truckTransaction.destination,
      cost: truckTransaction.cost,
      sellingPrice: truckTransaction.sellingPrice,
      customer: truckTransaction.customer,
      details: truckTransaction.details,
      isPrinted: truckTransaction.isPrinted,
      truckId: truckTransaction.truckId,
    };
  };

  return (
    <>
      <Head>
        <title>Truck Details</title>
      </Head>

      <div className="container p-10 mb-60 flex-col">
        <h1 className="text-center text-7xl mb-5">{customer.initial}</h1>

        <TruckTransactionDataTable
          headers={dataTableHeaders}
          data={truckTransactions.map((t) => formatTruckTransaction(t))}
          hiddenFields={['id', 'isPrinted', 'truckId']}
          autoCompleteData={autoCompleteData}
          emkl={true}
        />
      </div>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const customerId: string = context.params.id;
  const customer = await customerBloc.getCustomerByCustomerId(customerId);
  const truckTransactions =
    await truckTransactionBloc.getTruckTransactionsByCustomerId(customerId);
  const autoCompleteData =
    await truckTransactionBloc.getTruckTransactionAutoComplete();

  return {
    props: { truckTransactions, autoCompleteData, customer },
  };
};