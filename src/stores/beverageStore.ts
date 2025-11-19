import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  //setDoc,
  //doc,
  //QuerySnapshot,
  //QueryDocumentSnapshot,
  //onSnapshot,
  addDoc,
  //getDoc,
  //doc,
} from "firebase/firestore";

async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const items: T[] = [];
  querySnapshot.forEach((doc) => {items.push({ ...doc.data(), id: doc.id } as T); });
  return items;
}// Fetch collection from firestore and return as arraytype T

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
  }),

  actions: {

    async init() { // Initialize the store by fetching data from Firestore *VS code generated fetchCollection
      this.bases = await fetchCollection<BaseBeverageType>("bases");
      this.syrups = await fetchCollection<SyrupType>("syrups");
      this.creamers = await fetchCollection<CreamerType>("creamers");
      this.beverages = await fetchCollection<BeverageType>("beverages");
      this.currentBase = this.bases.length > 0 ? this.bases[0] : null;
      this.currentSyrup = this.syrups.length > 0 ? this.syrups[0] : null;
      this.currentCreamer = this.creamers.length > 0 ? this.creamers[0] : null;
    },

    
    async makeBeverage() {
      const newBeverage  = {
        name: this.currentName,
        temp: this.currentTemp,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
      };
      await addDoc(collection(db, "beverages"), newBeverage);// Add new beverage to Firestore
      this.beverages.push(newBeverage as BeverageType); // Update local state
      this.currentName = "";
    },

    showBeverage(beverage: BeverageType) {
      this.currentBeverage = beverage;
      this.currentTemp = beverage.temp;
      this.currentBase = beverage.base;
      this.currentCreamer = beverage.creamer;
      this.currentSyrup = beverage.syrup;
    },
  },
});

