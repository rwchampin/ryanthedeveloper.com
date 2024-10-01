'use client';
import Balance from '@/components/shared/main/account/billing/Balance';
import Invoice from '@/components/shared/main/account/billing/Invoices';
import Market from '@/components/shared/main/account/billing/Market';
import PaymentMethod from '@/components/shared/main/account/billing/PaymentMethod';
import YourCard from '@/components/shared/main/account/billing/YourCard';
import YourTransaction from '@/components/shared/main/account/billing/YourTransactions';
import YourTransfers from '@/components/shared/main/account/billing/YourTransfers';

const Billing = () => {
  return (
    <div className="mt-3 w-full">
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <YourCard />
        <div className="h-full w-full rounded-[20px]">
          <Balance />
          <PaymentMethod />
        </div>
        <Invoice />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div>
          <YourTransaction />
        </div>
        <div>
          <Market />
        </div>
        <div>
          <YourTransfers />
        </div>
      </div>
    </div>
  );
};

export default Billing;
