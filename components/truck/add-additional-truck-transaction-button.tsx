import { Modal } from 'flowbite-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import TextInput from '../text-input';
import {
  TransactionType,
  AdditionalTruckTransaction,
  BASE_URL,
} from '../../types/common';
import { useRouterRefresh } from '../../hooks/hooks';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PlusIcon } from '@heroicons/react/solid';
import { useToastContext } from '../../lib/toast-context';
import moment from 'moment';
import { PlusCircleIcon } from '@heroicons/react/outline';

interface AddAdditionalTruckTransactionButtonProps {
  truckId: string;
}

export default function AddAdditionalTruckTransactionButton({
  truckId,
}: AddAdditionalTruckTransactionButtonProps) {
  const addToast = useToastContext();
  const baseTransaction: Omit<AdditionalTruckTransaction, 'id' | 'date'> = {
    details: '',
    cost: 0,
    transactionType: TransactionType.TRUCK_ADDITIONAL_TRANSACTION,
    truckId,
    editableByUserUntil: moment()
      .endOf('month')
      .add(3, 'days')
      .utcOffset(7, false)
      .toDate(),
  };
  const refreshData = useRouterRefresh();
  const [transaction, setTransaction] = useState(baseTransaction);
  const [date, setDate] = useState(new Date());
  const [modal, setModal] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setTransaction((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  async function addTransaction() {
    await axios({
      method: 'POST',
      url: `${BASE_URL}/api/transaction/truck/misc`,
      data: { ...transaction, date },
    })
      .then(() => {
        setTransaction(baseTransaction);
        refreshData();
        setModal(false);
      })
      .catch((err) => {
        addToast(err.response.data.message);
      });
  }

  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResizeWindow = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResizeWindow);

    return () => {
      window.removeEventListener('resize', handleResizeWindow);
    };
  }, []);

  return (
    <>
      {width > 1200 ? (
        <button
          className="flex gap-1 border rounded-full py-2 px-10 shadow-sm transition-all"
          onClick={() => setModal(true)}
        >
          <PlusCircleIcon className="h-5 mt-0.5" />
          <span className="whitespace-nowrap">Tambah Transaksi</span>
        </button>
      ) : width < 742 ? (
        <button
          className="flex gap-1 border rounded-full py-2 px-3 shadow-sm transition-all"
          onClick={() => setModal(true)}
        >
          <PlusCircleIcon className="h-5 mt-0.5" />
        </button>
      ) : (
        <button
          className="flex gap-1 border rounded-full py-2 px-3 shadow-sm transition-all"
          onClick={() => setModal(true)}
        >
          <PlusCircleIcon className="h-5 mt-0.5" />
          <span className="whitespace-nowrap">Tambah Transaksi</span>
        </button>
      )}
      <Modal show={modal} onClose={() => setModal(false)} size="3xl">
        <Modal.Header>Transaksi Lainnya</Modal.Header>
        <Modal.Body>
          <form action="post">
            <div className="grid grid-rows-4 grid-cols-5 grid-flow-row gap-4">
              <div className="form-group row-span-1 col-span-3">
                <TextInput
                  label="Deskripsi"
                  name="details"
                  value={transaction.details}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group row-span-5 col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal
                </label>
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  selected={date}
                  onChange={(date: Date) => setDate(date)}
                />
              </div>
              <div className="form-group row-span-1 col-span-2">
                <TextInput
                  label="Harga"
                  name="cost"
                  type="currency"
                  value={transaction.cost}
                  prefix="Rp"
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <button
            className="bg-green-400
            hover:bg-green-500 text-white font-bold py-2 px-10 rounded w-full"
            onClick={addTransaction}
          >
            Tambah Transaksi
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
