import { BillingOverviewCard, ProductCard, usePremiumBilling } from "@/features/billing";
import { NativeButton, NativeScreen, NativeScroll, SectionHeading } from "@/shared/components";

const PremiumScreen = () => {
  const {
    products,
    balance,
    subscription,
    revenueCat,
    pending,
    backendStateUnavailable,
    reconciliationPending,
    purchase,
    restore,
    grouped,
  } = usePremiumBilling();
  return (
    <NativeScreen>
      <NativeScroll>
        <BillingOverviewCard
          balance={balance}
          subscription={subscription}
          revenueCat={revenueCat}
          reconciliationPending={reconciliationPending}
        />
        <SectionHeading title="구독" />
        {grouped.subscriptions.map((product) => (
          <ProductCard
            disabled={
              pending ||
              backendStateUnavailable ||
              reconciliationPending ||
              products.loading ||
              Boolean(products.error) ||
              revenueCat.state.status !== "ready" ||
              !revenueCat.state.packages[product.id]
            }
            key={product.id}
            onPress={() => void purchase(product)}
            price={
              revenueCat.state.status === "ready"
                ? revenueCat.state.packages[product.id]?.priceString
                : undefined
            }
            product={product}
          />
        ))}
        <SectionHeading title="아이템" />
        {grouped.items.map((product) => (
          <ProductCard
            disabled={
              pending ||
              backendStateUnavailable ||
              reconciliationPending ||
              products.loading ||
              Boolean(products.error) ||
              revenueCat.state.status !== "ready" ||
              !revenueCat.state.packages[product.id]
            }
            key={product.id}
            onPress={() => void purchase(product)}
            price={
              revenueCat.state.status === "ready"
                ? revenueCat.state.packages[product.id]?.priceString
                : undefined
            }
            product={product}
          />
        ))}
        <NativeButton
          disabled={
            pending ||
            backendStateUnavailable ||
            reconciliationPending ||
            revenueCat.state.status !== "ready"
          }
          label="구매 복원"
          onPress={() => void restore()}
          tone="secondary"
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

export default PremiumScreen;
