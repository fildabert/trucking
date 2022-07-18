import { Table } from 'flowbite-react';
import EditAdditionalTruckTransactionButton from './truck/edit-additional-truck-transaction-button';
import { DataTableTransaction, TransactionType } from '../types/common';

interface DataTableProperties {
  headers: Record<string, string>;
  data: DataTableTransaction[];
  hiddenFields?: string[];
}

export default function TransactionDataTable({
  headers,
  data,
  hiddenFields,
}: DataTableProperties) {
  function buildTransactionRow(obj: DataTableTransaction) {
    const tableTransaction: Record<string, string | number | Date | boolean> = {
      ...obj,
    };

    if (hiddenFields) {
      for (const field of hiddenFields) {
        delete tableTransaction[field];
      }
    }

    return (
      <>
        {Object.values(tableTransaction).map((val, i) => (
          <Table.Cell className="whitespace-nowrap" key={`td-${obj.id}-${i}`}>
            {val ? val.toString() : ''}
          </Table.Cell>
        ))}
      </>
    );
  }

  return (
    <>
      <Table hoverable={true}>
        <Table.Head className="whitespace-nowrap">
          {Object.entries(headers).map(([header, columnWidth], index) => (
            <Table.HeadCell key={index} className={`${columnWidth}`}>
              {header}
            </Table.HeadCell>
          ))}
          <Table.HeadCell>Edit</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((transaction, index) => {
            return (
              <Table.Row key={`tr-${index}`}>
                {buildTransactionRow(transaction)}
                {
                  <Table.Cell>
                    <EditAdditionalTruckTransactionButton
                      key={`edit-modal-key${index}`}
                      existingTransaction={{
                        ...transaction,
                        transactionType: TransactionType.ADDITIONAL_TRANSACTION,
                      }}
                    />
                  </Table.Cell>
                }
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}