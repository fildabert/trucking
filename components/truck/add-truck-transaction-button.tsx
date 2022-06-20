import Modal from '../modal';
import axios from 'axios';
import { useState } from 'react';
import TextInput from '../text-input';
import { TransactionType, TruckTransaction } from '../../types/common';
import { useRouterRefresh } from '../../hooks/hooks';

export default function AddTruckTransactionButton() {
  const baseTruckTransaction: Omit<TruckTransaction, 'id' | 'date'> = {
    containerNo: '',
    invoiceNo: '',
    destination: '',
    cost: 0,
    sellingPrice: 0,
    customer: '',
    details: '',
    transactionType: TransactionType.TRUCK_TRANSACTION,
    truckId: '',
  };
  const [truckTransaction, setTruckTransaction] =
    useState(baseTruckTransaction);
  const refreshData = useRouterRefresh();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setTruckTransaction((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function addTruckTransaction() {
    // TODO: add API POST /api/transaction/{truckID}
    await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/transaction',
      data: truckTransaction,
    });
    setTruckTransaction(baseTruckTransaction);
    refreshData();
  }

  return (
    <>
      <Modal
        buttonConfig={{ text: 'Tambah Transaksi Baru' }}
        confirmButtonConfig={{ text: 'Bikin Transaksi' }}
        onConfirm={addTruckTransaction}
        width="w-2/5"
        child={
          <>
            <h1 className="text-2xl">Tambah Transaksi Baru</h1>
            <form action="post">
              <div className="grid grid-rows-2 grid-cols-5 grid-flow-row gap-4">
                <div className="form-group row-span-1 col-span-2">
                  <TextInput
                    label="No. Container"
                    name="containerNo"
                    value={truckTransaction.containerNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group row-span-1 col-span-2">
                  <TextInput
                    label="No. Invoice"
                    name="invoiceNo"
                    value={truckTransaction.invoiceNo}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group row-span-1 col-span-1">
                  <TextInput
                    label="EMKL"
                    name="customer"
                    value={truckTransaction.customer}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group row-span-1 col-span-3">
                  <TextInput
                    label="Tujuan"
                    name="destination"
                    value={truckTransaction.destination}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group row-span-1 col-span-1">
                  <TextInput
                    label="Borongan"
                    name="cost"
                    value={truckTransaction.cost}
                    prefix="Rp"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group row-span-1 col-span-1">
                  <TextInput
                    label="Pembayaran"
                    name="sellingPrice"
                    value={truckTransaction.sellingPrice}
                    prefix="Rp"
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group row-span-1 col-span-5">
                  <TextInput
                    label="Deskripsi/Info Tambahan"
                    name="details"
                    value={truckTransaction.details}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </form>
          </>
        }
      />
    </>
  );
}
