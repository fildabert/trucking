import { Truck } from '../../types/common';
import { TruckModel } from './truck.model';
import { Document } from 'mongoose';

const convertDocumentToObject = <T>(document: Document) =>
  document.toObject({ getters: true }) as T;

const createTruck = async (truckPayload: Omit<Truck, 'id'>) => {
  const truck = await TruckModel.create(truckPayload);
  return convertDocumentToObject<Truck>(truck);
};

const getTrucks = async () => {
  const trucks = await TruckModel.find({});
  return trucks.map((truck) => convertDocumentToObject<Truck>(truck));
};

const editTruck = async (
  editTruckPayload
) => {
  const document = await TruckModel.findOneAndUpdate(
    { _id: editTruckPayload.id },
    editTruckPayload
  );
  const truck = convertDocumentToObject<Truck>(document);
  return truck;
};

const truckRepository = {
  createTruck,
  getTrucks,
  editTruck
};

export default truckRepository;
