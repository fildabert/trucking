import Head from 'next/head';
import { InferGetServerSidePropsType } from 'next';
import truckTransactionBloc from '../lib/truckTransaction';
import { formatRupiah } from '../helpers/hbsHelpers';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GetServerSideProps } from 'next';
import { getCookie } from 'cookies-next';
import * as jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';

const defaultStartDate = new Date(2020, 1, 1);
const defaultEndDate = new Date(new Date().setHours(23, 59, 59));

export default function Home({
  truckSummaries,
  summaries,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const access_token = getCookie('access_token');
  const user = jwt.decode(access_token, process.env.SECRET_KEY);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  });

  const [truckSummariesState, setTruckSummariesState] =
    useState(truckSummaries);

  const [summariesState, setSummariesState] = useState(summaries);

  const entries = Object.entries(truckSummariesState);
  entries.sort();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  async function filterByMonth() {
    const truckSummaries =
      await truckTransactionBloc.getGroupedTruckTransactions({
        access_token,
        startDate,
        endDate,
      });
    const summaries = await truckTransactionBloc.getTotalSummary({
      access_token,
      startDate,
      endDate,
    });

    setTruckSummariesState(truckSummaries);
    setSummariesState(summaries);
  }

  async function printSummary() {
    const response = await truckTransactionBloc.printSummary({
      startDate,
      endDate,
    });
  }

  return (
    <>
      <Head>
        <title>{'Home'}</title>
      </Head>
      <div className="container m-auto">
        <h2 className="text-7xl text-center m-auto">Rekap</h2>

        <div className="flex w-56 gap-5 mx-3 my-5">
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={startDate}
            onChange={(date: Date) =>
              setStartDate(new Date(new Date(date).setHours(0, 0, 0)))
            }
          />
          <span className="text-3xl">-</span>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            selected={endDate}
            onChange={(date: Date) =>
              setEndDate(new Date(new Date(date).setHours(23, 59, 59)))
            }
            minDate={startDate}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={filterByMonth}
          >
            Filter
          </button>
        </div>
        {user?.role !== 'user' && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-5"
            onClick={printSummary}
          >
            Print Laporan
          </button>
        )}

        <div
          className={`${
            user?.role === 'user' && 'grid-cols-2'
          } grid grid-cols-4 gap-7 text-center mt-6 border border-gray-200 rounded p-5 m-3 bg-zinc-100 shadow-md`}
        >
          {user?.role !== 'user' && (
            <div className="bg-white shadow-md rounded">
              <div className="bg-green-100">
                <div className="bg-green-400 h-1 w-full"></div>
                <h3 className="text-2xl py-3">Total Pembayaran</h3>
              </div>
              <h4 className="text-2xl font-bold  py-6">
                {formatRupiah(summariesState.totalTripSellingPrice)}
              </h4>
            </div>
          )}

          <div className="bg-white shadow-md rounded">
            <div className="bg-red-100">
              <div className="bg-red-400 h-1 w-full"></div>
              <h3 className="text-2xl py-3">Total Biaya Mobil</h3>
            </div>
            <h4 className="text-2xl font-bold  py-6">
              {formatRupiah(summariesState.totalTripCost)}
            </h4>
          </div>

          <div className="bg-white shadow-md rounded">
            <div className="bg-orange-100">
              <div className="bg-orange-400 h-1 w-full"></div>
              <h3 className="text-2xl py-3">Total Pengeluaran Lain</h3>
            </div>
            <h4 className="text-2xl font-bold py-6">
              {formatRupiah(summariesState.totalAdditionalCost)}
            </h4>
          </div>

          {user?.role !== 'user' && (
            <div className="bg-white shadow-md rounded">
              <div className="bg-blue-100">
                <div className="bg-blue-400 h-1 w-full"></div>
                <h3 className="text-2xl py-3">Total Margin</h3>
              </div>
              <h4 className="text-2xl font-bold py-6">
                {formatRupiah(summariesState.totalMargin)}
              </h4>
            </div>
          )}
        </div>
        <hr className="m-5" />
        <div className="grid grid-cols-3">
          {entries.map((entry, i: number) => {
            return (
              <a
                href={`/trucks/${entry[1].truckId}?truckName=${entry[0]}`}
                key={i}
                className="gap-40 px-6 py-3 m-5 rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
              >
                <div className="relative">
                  <h3 className="text-5xl whitespace-nowrap text-center justify-center align-middle">
                    {entry[0]}
                  </h3>
                </div>

                <div>
                  {user?.role !== 'user' && (
                    <h3 className="my-2 text-green-400 text-center font-medium">
                      Pembayaran: {formatRupiah(entry[1].sellingPrice)}
                    </h3>
                  )}
                  <h3 className="my-2 text-red-400 text-center font-medium">
                    Borongan: {formatRupiah(entry[1].cost)}
                  </h3>
                  <h3 className="my-2 text-red-400 text-center font-medium">
                    Biaya: {formatRupiah(entry[1].additionalCost)}
                  </h3>
                  <hr />
                  {user?.role !== 'user' && (
                    <h3 className="my-2 text-center font-medium">
                      Margin: {formatRupiah(entry[1].margin)}
                    </h3>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const access_token = getCookie('access_token', {
    req: context.req,
    res: context.res,
  });

  try {
    jwt.verify(access_token, process.env.SECRET_KEY);
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: `/login`,
      },
    };
  }

  const truckSummaries = await truckTransactionBloc.getGroupedTruckTransactions(
    {
      access_token,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }
  );
  const summaries = await truckTransactionBloc.getTotalSummary({
    access_token,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  return {
    props: {
      truckSummaries,
      summaries,
    },
  };
};
