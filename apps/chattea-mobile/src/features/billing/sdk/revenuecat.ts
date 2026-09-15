import Purchases, { type PurchasesPackage } from "react-native-purchases";

import type { RevenueCatOfferings, RevenueCatPackage, RevenueCatSdk } from "../types";

export const revenueCatSdk: RevenueCatSdk = {
  configure: (input) => Purchases.configure(input),
  getAppUserID: () => Purchases.getAppUserID(),
  getOfferings: async (): Promise<RevenueCatOfferings> => {
    const offerings = await Purchases.getOfferings();
    return {
      current: offerings.current
        ? {
            availablePackages: offerings.current.availablePackages as RevenueCatPackage[],
          }
        : null,
    };
  },
  isConfigured: () => Purchases.isConfigured(),
  logIn: async (userId) => {
    await Purchases.logIn(userId);
  },
  logOut: async () => {
    await Purchases.logOut();
  },
  purchasePackage: async (selectedPackage) => {
    await Purchases.purchasePackage(selectedPackage as PurchasesPackage);
  },
  restorePurchases: async () => {
    const customerInfo = await Purchases.restorePurchases();
    return { activeSubscriptions: [...customerInfo.activeSubscriptions] };
  },
};
